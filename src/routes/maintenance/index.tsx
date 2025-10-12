import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Maintenance } from "@/lib/Types";

import { MaintenanceCard } from "@/components/MaintenanceCard";
import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { Button } from "@/components/ui/button";

type MaintenanceFilter = "all" | "overdue" | "pending" | "completed";

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
  const [selectedTask, setSelectedTask] = useState<Maintenance | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const { data: maintenances = [], isLoading } = useQuery<Maintenance[]>({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/maintenance");
    },
    enabled: !!user,
  });

  const editMutation = useMutation({
    mutationFn: async (updatedTask: Maintenance) => {
      if (!user) throw new Error("User not authenticated");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...taskData } = updatedTask;
      return apiFetch(user.id, `/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      setEditModalOpen(false);
      setSelectedTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error("User not authenticated");
      return apiFetch(user.id, `/maintenance/${taskId}`, {
        method: "DELETE",
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

  const createNextMaintenanceMutation = useMutation({
    mutationFn: async (newMaintenance: Omit<Maintenance, "id">) => {
      if (!user) throw new Error("User not authenticated");
      const { assetId, ...body } = newMaintenance;
      return apiFetch(user.id, `/assets/${assetId}/maintenance`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
    },
    onError: (error) => {
      console.error("Failed to create next maintenance task:", error);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      task,
      newStatus,
    }: {
      task: Maintenance;
      newStatus: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const { id, ...updatedTaskData } = { ...task, maintenanceStatus: newStatus };
      return apiFetch(user.id, `/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedTaskData),
      });
    },
    onSuccess: (_data, { task, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      if (newStatus === "completed" && task.preserveFromPrior) {
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        const { id, ...oldTaskData } = task;
        const newTask: Omit<Maintenance, "id"> = {
          ...oldTaskData,
          maintenanceStatus: "pending",
          maintenanceDueDate: twoWeeksFromNow.toISOString(),
        };
        createNextMaintenanceMutation.mutate(newTask);
      }
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    const taskToUpdate = maintenances.find((task) => task.id === id);
    if (taskToUpdate) {
      updateStatusMutation.mutate({ task: taskToUpdate, newStatus: status });
    }
  };

  const handleDelete = (taskId: string) => {
    deleteMutation.mutate(taskId);
  };

  const handleViewDetails = (task: Maintenance) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTask(null);
  };

  const handleEdit = (task: Maintenance) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(false); // Close details modal
    setEditModalOpen(true); // Open edit modal
  };

  const handleSaveEdit = (updatedTask: Maintenance) => {
    editMutation.mutate(updatedTask);
  };

  const sortedAndFilteredItems = useMemo(() => {
    const now = new Date();
    const itemsWithStatus = maintenances.map((task) => {
      const isOverdue =
        task.maintenanceStatus === "pending" &&
        new Date(task.maintenanceDueDate) < now;
      return { ...task, status: isOverdue ? "overdue" : task.maintenanceStatus };
    });

    const filtered = itemsWithStatus.filter((item) => {
      if (activeFilter === "all") return true;
      return item.status === activeFilter;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.maintenanceDueDate).getTime();
      const dateB = new Date(b.maintenanceDueDate).getTime();
      if (activeFilter === "completed") {
        return dateB - dateA; // Most recent first for history
      }
      return dateA - dateB; // Soonest first for all others
    });
  }, [maintenances, activeFilter]);

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <section className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-gray">My Maintenance</h1>
            <p className="text-gray-500 mt-1">Keep track of all your maintenance tasks.</p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors px-4 py-2 h-auto text-base"
          >
            Add Maintenance
          </Button>
        </div>

        <AddMaintenanceModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
        />

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

        {/* Filter Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "overdue", label: "Overdue" },
            { key: "pending", label: "Upcoming" },
            { key: "completed", label: "History" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterChange(key as MaintenanceFilter)}
              className={`pb-2 px-1 font-semibold text-lg border-b-2 transition-colors cursor-pointer ${
                activeFilter === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Maintenance Items List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-primary-gray">
              Loading maintenance tasks...
            </div>
          ) : sortedAndFilteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">
                No maintenance items found for this filter.
              </p>
            </div>
          ) : (
            sortedAndFilteredItems.map((maintenance) => (
              <MaintenanceCard
                key={maintenance.id}
                task={maintenance}
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