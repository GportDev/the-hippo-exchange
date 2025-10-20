import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import type { Maintenance, Asset } from "@/lib/Types";

import { MaintenanceCard } from "@/components/MaintenanceCard";
import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { MaintenanceSkeleton } from "@/components/MaintenanceSkeleton";
import { AlertTriangle, ClipboardList, ShieldCheck, Clock, ArrowRight } from "lucide-react";

type MaintenanceStatus = "overdue" | "pending" | "completed";
type MaintenanceFilter = "all" | MaintenanceStatus;

const validateFilter = (filter: unknown): MaintenanceFilter => {
  const validFilters: MaintenanceFilter[] = [
    "all",
    "overdue",
    "pending",
    "completed",
  ];
  if (typeof filter === "string" && validFilters.includes(filter as MaintenanceFilter)) {
    return filter as MaintenanceFilter;
  }
  return "all";
};

export const Route = createFileRoute("/maintenance/")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: validateFilter(search.filter),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { filter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const apiClient = useApiClient();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MaintenanceFilter>(filter);
  const [selectedTask, setSelectedTask] = useState<(Maintenance & { status: MaintenanceStatus }) | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: maintenances = [], isLoading: isLoadingMaintenance } = useQuery<Maintenance[]>({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Maintenance[]>("/maintenance");
    },
    enabled: !!user,
  });

  // Fetch user's assets to map images to maintenance cards
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [] as Asset[];
      return apiClient<Asset[]>("/assets");
    },
    enabled: !!user,
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: (newMaintenance: Omit<Maintenance, "id">) => {
      if (!user) throw new Error("User not authenticated");
      return apiClient(`/assets/${newMaintenance.assetId}/maintenance`, {
        method: "POST",
        body: JSON.stringify(newMaintenance),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
    },
    onError: (error) => {
      console.error("Failed to create recurring maintenance task:", error);
    },
  });

  const editMutation = useMutation<void, Error, Partial<Maintenance> & { id: string }>({
    mutationFn: async (updatedTask) => {
      if (!user) throw new Error("User not authenticated");
      const { id, ...payload } = updatedTask;
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => {
          if (value === null) return [key, undefined];
          if (value === "" && ["purchaseLocation"].includes(key)) return [key, undefined];
          if (key === "assetCategory" && (value === "" || value === null || value === undefined)) {
            return [key, "Electronics"];
          }
          return [key, value];
        })
      );
      await apiClient(`/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(cleanPayload),
        skipJsonParsing: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      setEditModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      console.error("Failed to update maintenance task:", error);
    },
  });

  const updateMaintenanceMutation = useMutation<
    void,
    Error,
    { taskId: string; payload: Partial<Maintenance> },
    { originalTask?: Maintenance }
  >({
    mutationFn: async ({ taskId, payload }) => {
      if (!user) throw new Error("User not authenticated");
      await apiClient(`/maintenance/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        skipJsonParsing: true,
      });
    },
    onSuccess: (_data, variables, context) => {
      const originalTask = context?.originalTask;
      if (variables.payload.isCompleted && originalTask?.preserveFromPrior) {
        const oldDueDate = new Date(originalTask.maintenanceDueDate);
        const interval = originalTask.recurrenceInterval || 0;
        switch (originalTask.recurrenceUnit) {
          case "Days":
            oldDueDate.setDate(oldDueDate.getDate() + interval);
            break;
          case "Weeks":
            oldDueDate.setDate(oldDueDate.getDate() + interval * 7);
            break;
          case "Months":
            oldDueDate.setMonth(oldDueDate.getMonth() + interval);
            break;
          case "Years":
            oldDueDate.setFullYear(oldDueDate.getFullYear() + interval);
            break;
        }
        const newDueDate = oldDueDate.toISOString();
        const nextTaskPayload: Omit<Maintenance, "id"> = {
          ...originalTask,
          maintenanceDueDate: newDueDate,
          isCompleted: false,
          maintenanceStatus: "Upcoming",
        };
        (nextTaskPayload as Partial<Maintenance>).id = undefined;
        addMaintenanceMutation.mutate(nextTaskPayload);
      }
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["maintenance", user?.id] });
      const previousMaintenance = queryClient.getQueryData<Maintenance[]>(["maintenance", user?.id]);
      const originalTask = previousMaintenance?.find((task) => task.id === variables.taskId);
      return { originalTask };
    },
    onError: (err, _variables, context) => {
      console.error("Update failed:", err);
      if (context?.originalTask) {
        queryClient.setQueryData(["maintenance", user?.id], (old: Maintenance[] = []) =>
          old.map((task) => (task.id === context.originalTask?.id ? context.originalTask : task))
        );
      }
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (taskId) => {
      if (!user) throw new Error("User not authenticated");
      await apiClient(`/maintenance/${taskId}`, {
        method: "DELETE",
        skipJsonParsing: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      setIsDetailsModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      console.error("Failed to delete maintenance task:", error);
    },
  });

  useEffect(() => {
    setActiveFilter(filter);
  }, [filter]);

  const handleFilterChange = (newFilter: MaintenanceFilter) => {
    setActiveFilter(newFilter);
    navigate({
      search: { filter: newFilter },
      replace: true,
    });
  };

  const itemsWithStatus = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return maintenances.map((task) => {
      const status: MaintenanceStatus = task.isCompleted
        ? "completed"
        : new Date(task.maintenanceDueDate) < now
        ? "overdue"
        : "pending";
      return { ...task, status };
    });
  }, [maintenances]);

  const counts = useMemo(() => ({
    all: itemsWithStatus.length,
    overdue: itemsWithStatus.filter((t) => t.status === "overdue").length,
    pending: itemsWithStatus.filter((t) => t.status === "pending").length,
    completed: itemsWithStatus.filter((t) => t.status === "completed").length,
  }), [itemsWithStatus]);

  const sortedAndFilteredItems = useMemo(() => {
    const base = activeFilter === "all" ? itemsWithStatus : itemsWithStatus.filter((t) => t.status === activeFilter);
    return [...base].sort((a, b) => {
      const dateA = new Date(a.maintenanceDueDate).getTime();
      const dateB = new Date(b.maintenanceDueDate).getTime();

      if (activeFilter === "all") {
        // Push completed items to the bottom regardless of date; sort others by date asc
        const aCompleted = a.status === "completed";
        const bCompleted = b.status === "completed";
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return dateA - dateB;
      }

      if (activeFilter === "completed") {
        // History: newest completed first
        return dateB - dateA;
      }

      // Overdue/Upcoming: earliest due first
      return dateA - dateB;
    });
  }, [itemsWithStatus, activeFilter]);

  const assetImageMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const a of assets) {
      map.set(a.id, a.images?.[0] || "/public/placeholder.jpg");
    }
    return map;
  }, [assets]);

  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isLoaded || isLoadingMaintenance || isLoadingAssets) {
    return <MaintenanceSkeleton />;
  }

  const handleUpdateStatus = (id: string, isCompleted: boolean) => {
    updateMaintenanceMutation.mutate({ taskId: id, payload: { isCompleted } });
  };
  const handleDelete = (taskId: string) => deleteMutation.mutate(taskId);
  const handleViewDetails = (task: Maintenance & { status: MaintenanceStatus }) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTask(null);
  };
  const handleEdit = (task: Maintenance & { status: MaintenanceStatus }) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(false);
    setEditModalOpen(true);
  };
  const handleSaveEdit = (updatedTask: Maintenance) => {
    if (updatedTask.id) editMutation.mutate({ ...updatedTask, id: updatedTask.id });
  };

  const heroStats = [
    {
      label: "All Tasks",
      value: counts.all.toString(),
      description: "Total upkeep items across your lending fleet",
      Icon: ClipboardList,
      accent: "from-blue-500/25 to-blue-500/5",
      iconColor: "text-blue-200",
    },
    {
      label: "Overdue",
      value: counts.overdue.toString(),
      description: "Jobs that need immediate attention",
      Icon: AlertTriangle,
      accent: "from-rose-500/25 to-rose-500/5",
      iconColor: "text-rose-200",
    },
    {
      label: "Completed",
      value: counts.completed.toString(),
      description: "Maintenance tasks closed this cycle",
      Icon: ShieldCheck,
      accent: "from-emerald-500/25 to-emerald-500/5",
      iconColor: "text-emerald-200",
    },
  ];

  const heroFeatures = [
    {
      title: "Schedule upkeep",
      description: "Create recurring tasks so borrowers always return gear in top shape.",
      Icon: Clock,
    },
    {
      title: "Borrower checklists",
      description: "Attach instructions for inspections, clean-up, and safety steps.",
      Icon: ClipboardList,
    },
    {
      title: "Protect your investment",
      description: "Track accountability and keep an audit trail for every loan.",
      Icon: ShieldCheck,
    },
  ];

  const filterOptions = [
    { key: "all" as MaintenanceFilter, label: "All" },
    { key: "overdue" as MaintenanceFilter, label: "Overdue" },
    { key: "pending" as MaintenanceFilter, label: "Upcoming" },
    { key: "completed" as MaintenanceFilter, label: "Completed" },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl rounded-b-[50%] bg-primary-yellow/20 blur-[120px]" />
        <PageContainer as="div" className="relative space-y-12 pt-10">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-primary-yellow/25 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
              </div>
              <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
                <div className="space-y-8">
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                      Maintenance cockpit
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Keep borrowers on schedule</h1>
                      <p className="max-w-xl text-base text-white/70 sm:text-lg">
                        Centralize upkeep tasks, follow recurring plans, and make sure every item returns better than it left.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => setAddModalOpen(true)}
                      className="flex items-center gap-2 rounded-full bg-primary-yellow px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80"
                    >
                      Add maintenance task
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Link
                      to="/assets/my-assets"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
                    >
                      Jump to your assets
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {heroStats.map(({ label, value, Icon, accent, iconColor, description }) => (
                      <div
                        key={label}
                        className={`group gradient-border rounded-2xl border border-white/5 bg-gradient-to-br ${accent} p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl`}
                      >
                        <div className="rounded-2xl bg-slate-950/60 p-5 backdrop-blur">
                          <div className={`mb-3 inline-flex rounded-full bg-white/10 p-2 ${iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.4em] text-white/60">{label}</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                          <p className="mt-2 text-xs text-white/60">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {heroFeatures.map(({ title, description, Icon }) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-3 inline-flex rounded-full bg-white/10 p-2 text-primary-yellow">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs text-white/60">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative animate-scale-in">
                    <div className="absolute -inset-10 rounded-[2.75rem] bg-primary-yellow/20 blur-[100px]" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-xl backdrop-glow">
                      {sortedAndFilteredItems.length > 0 ? (
                        <MaintenanceCard
                          task={sortedAndFilteredItems[0]}
                          imageUrl={assetImageMap.get(sortedAndFilteredItems[0].assetId)}
                          onUpdateStatus={handleUpdateStatus}
                          onViewDetails={handleViewDetails}
                        />
                      ) : (
                        <div className="flex h-80 w-[28rem] flex-col items-center justify-center gap-3 text-white/60">
                          <ClipboardList className="h-12 w-12" />
                          <p>No maintenance tasks yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  {filterOptions.map(({ key, label }) => {
                    const isActive = activeFilter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleFilterChange(key)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-yellow/60 ${
                          isActive
                            ? "border-primary-yellow/60 bg-primary-yellow/10 text-primary-yellow"
                            : "border-white/20 bg-white/5 text-white/70 hover:border-primary-yellow/40 hover:text-white"
                        }`}
                      >
                        <span>{label}</span>
                        <span className="ml-2 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs">
                          {counts[key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {sortedAndFilteredItems.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center text-white/70 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                    <ClipboardList className="mx-auto mb-4 h-12 w-12 text-white/40" />
                    <h3 className="text-xl font-semibold text-white">No maintenance items match this filter</h3>
                    <p className="mt-2 text-sm text-white/60">
                      Adjust your filters or create a maintenance plan to keep borrowers on task.
                    </p>
                  </div>
                ) : (
                  sortedAndFilteredItems.map((maintenance) => (
                    <MaintenanceCard
                      key={maintenance.id}
                      task={maintenance}
                      imageUrl={assetImageMap.get(maintenance.assetId)}
                      onUpdateStatus={handleUpdateStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </section>
        </PageContainer>
      </main>

      <AddMaintenanceModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />

      {isDetailsModalOpen && selectedTask && (
        <MaintenanceDetailsModal
          task={selectedTask}
          onClose={handleCloseDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <EditMaintenanceModal
        task={isEditModalOpen ? selectedTask : null}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
