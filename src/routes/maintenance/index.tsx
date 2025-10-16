import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Maintenance } from "@/lib/Types";

import { MaintenanceCardWithImage } from "@/components/MaintenanceCardWithImage";
import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { Button } from "@/components/ui/button";

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

  const addMaintenanceMutation = useMutation({
    mutationFn: (newMaintenance: Omit<Maintenance, "id">) => {
      if (!user) throw new Error("User not authenticated");
      return apiFetch(
        user.id,
        `/assets/${newMaintenance.assetId}/maintenance`,
        {
          method: "POST",
          body: JSON.stringify(newMaintenance),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
    },
    onError: (error) => {
      console.error("Failed to create recurring maintenance task:", error);
    },
  });

  const editMutation = useMutation<
    Maintenance,
    Error,
    Partial<Maintenance> & { id: string }
  >({
    mutationFn: async (updatedTask) => {
      if (!user) throw new Error("User not authenticated");
      const { id, ...payload } = updatedTask;
      
      // Clean the payload: convert null to undefined and handle empty strings
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => {
          if (value === null) {
            return [key, undefined];
          }
          if (value === "" && ['purchaseLocation'].includes(key)) {
            return [key, undefined];
          }
          // Ensure assetCategory has a valid value if it's empty
          if (key === 'assetCategory' && (value === "" || value === null || value === undefined)) {
            return [key, "Electronics"];
          }
          return [key, value];
        })
      );
      
      console.log("Mutation payload:", cleanPayload);
      console.log("JSON stringified payload:", JSON.stringify(cleanPayload));
      return apiFetch(user.id, `/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(cleanPayload),
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
    Maintenance,
    Error,
    { taskId: string; payload: Partial<Maintenance> },
    { originalTask?: Maintenance }
  >({
    mutationFn: async ({ taskId, payload }) => {
      if (!user) throw new Error("User not authenticated");
      return apiFetch(user.id, `/maintenance/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
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

        delete (nextTaskPayload as Partial<Maintenance>).id;

        addMaintenanceMutation.mutate(nextTaskPayload);
      } else {
        queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["maintenance", user?.id],
      });
      const previousMaintenance = queryClient.getQueryData<Maintenance[]>([
        "maintenance",
        user?.id,
      ]);
      const originalTask = previousMaintenance?.find(
        (task) => task.id === variables.taskId,
      );
      return { originalTask };
    },
    onError: (err, _variables, context) => {
      console.error("Update failed:", err);
      if (context?.originalTask) {
        queryClient.setQueryData(
          ["maintenance", user?.id],
          (old: Maintenance[] = []) =>
            old.map((task) =>
              task.id === context.originalTask?.id
                ? context.originalTask
                : task,
            ),
        );
      }
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (taskId) => {
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

  const handleUpdateStatus = (id: string, isCompleted: boolean) => {
    updateMaintenanceMutation.mutate({ taskId: id, payload: { isCompleted } });
  };

  const handleDelete = (taskId: string) => {
    deleteMutation.mutate(taskId);
  };

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
    if (updatedTask.id) {
      editMutation.mutate({ ...updatedTask, id: updatedTask.id });
    }
  };

  const sortedAndFilteredItems = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    const itemsWithStatus = maintenances.map((task) => {
      let status: MaintenanceStatus;
      if (task.isCompleted) {
        status = "completed";
      } else if (new Date(task.maintenanceDueDate) < now) {
        status = "overdue";
      } else {
        status = "pending";
      }
      return { ...task, status };
    });

    const filtered = itemsWithStatus.filter((item) => {
      if (activeFilter === "all") return true;
      return item.status === activeFilter;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.maintenanceDueDate).getTime();
      const dateB = new Date(b.maintenanceDueDate).getTime();
      if (activeFilter === "completed") {
        return dateB - dateA; 
      }
      return dateA - dateB;
    });
  }, [maintenances, activeFilter]);

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <section className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6 pr-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-gray">My Maintenance</h1>
            <p className="text-gray-500 mt-1">Keep track of all your maintenance tasks.</p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors px-6 py-2 h-auto text-base flex items-center gap-2 mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Task
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
              <MaintenanceCardWithImage
                key={maintenance.id}
                task={maintenance}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={handleViewDetails}
                userId={user?.id ?? ''}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}