import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Maintenance, Asset } from "@/lib/Types";

import { MaintenanceCard } from "@/components/MaintenanceCard";
import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { Button } from "@/components/ui/button";
import { MaintenanceSkeleton } from "@/components/MaintenanceSkeleton";

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
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MaintenanceFilter>(filter);
  const [selectedTask, setSelectedTask] = useState<(Maintenance & { status: MaintenanceStatus }) | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: maintenances = [], isLoading: isLoadingMaintenance } = useQuery<Maintenance[]>({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/maintenance");
    },
    enabled: !!user,
  });

  // Fetch user's assets to map images to maintenance cards
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [] as Asset[];
      return apiFetch(user.id, "/assets");
    },
    enabled: !!user,
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: (newMaintenance: Omit<Maintenance, "id">) => {
      if (!user) throw new Error("User not authenticated");
      return apiFetch(user.id, `/assets/${newMaintenance.assetId}/maintenance`, {
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

  const editMutation = useMutation<Maintenance, Error, Partial<Maintenance> & { id: string }>({
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
      return apiFetch(user.id, `/maintenance/${id}`, { method: "PUT", body: JSON.stringify(cleanPayload) });
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
    Maintenance,
    Error,
    { taskId: string; payload: Partial<Maintenance> },
    { originalTask?: Maintenance }
  >({
    mutationFn: async ({ taskId, payload }) => {
      if (!user) throw new Error("User not authenticated");
      return apiFetch(user.id, `/maintenance/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) });
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
        delete (nextTaskPayload as Partial<Maintenance>).id;
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
      return apiFetch(user.id, `/maintenance/${taskId}`, { method: "DELETE" });
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
      map.set(a.id, a.images?.[0] || "/HippoTransparent.png");
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

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <section className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-gray">My Maintenance</h1>
            <p className="text-gray-500">Keep track of all your maintenance tasks.</p>
          </div>
        </div>

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

        <div className="flex gap-6 border-b border-gray-200 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "overdue", label: "Overdue" },
            { key: "pending", label: "Upcoming" },
            { key: "completed", label: "Completed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterChange(key as MaintenanceFilter)}
              className={`relative px-1 font-semibold text-lg border-b-2 transition-colors cursor-pointer items-center justify-center  ${
                activeFilter === key ? "border-primary-gray text-primary-gray" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              <span
                className={`md:ml-2 mb-1 inline-block min-w-[1.5em] px-2 py-1 rounded-full text-xs font-bold align-middle ${
                  key === "overdue"
                    ? "bg-red-100 text-red-800"
                    : key === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : key === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}
                aria-label={`Number of ${label.toLowerCase()} tasks`}
              >
                {counts[key as keyof typeof counts]}
              </span>
            </button>
          ))}
          <div className="flex-grow" />
          <Button
            onClick={() => setAddModalOpen(true)}
            className="p-6 px-8 mb-2 mr-5 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-base hidden sm:inline">Add Task</span>
          </Button>
        </div>

        <div className="space-y-4">
          {sortedAndFilteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No maintenance items found for this filter.</p>
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
    </div>
  );
}