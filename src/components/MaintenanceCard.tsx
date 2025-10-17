import { Badge } from "@/components/ui/badge";
import { Calendar, Package } from "lucide-react";
import type { Maintenance } from "@/lib/Types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type MaintenanceStatus = "overdue" | "pending" | "completed";

interface MaintenanceCardProps {
  task: Maintenance & { status: MaintenanceStatus };
  imageUrl?: string;
  onUpdateStatus?: (maintenanceId: string, isCompleted: boolean) => void;
  onViewDetails: (task: Maintenance & { status: MaintenanceStatus }) => void;
}

export function MaintenanceCard({
  task,
  imageUrl,
  onUpdateStatus,
  onViewDetails,
}: MaintenanceCardProps) {
  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-primary-yellow/40">
      <div className={`absolute left-0 top-0 h-full w-1 sm:w-1.5 bg-primary-gray`}></div>
      <div className="flex items-start gap-4">
        {imageUrl && (
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
            <img
              src={imageUrl}
              alt={task.productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-primary-gray">
              {task.maintenanceTitle}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
            >
              <Badge className={getStatusColor()}>
                {task.status === "pending"
                  ? "Upcoming"
                  : task.status.charAt(0).toUpperCase() +
                    task.status.slice(1)}
              </Badge>
            </span>
          </div>
          <p className="text-gray-600 mb-2">
            {task.maintenanceDescription || "No description provided."}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              <Package className="h-3.5 w-3.5 text-gray-500" />
              <span>{task.brandName} {task.productName}</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700`}>
              <Calendar className="h-4 w-4" />
              <span>{formatDate(task.maintenanceDueDate)}</span>
            </span>
            
          </div>
        </div>
        <div className="ml-2 sm:ml-4 grid space-y-2 sm:space-y-4 flex-shrink-0">
            <button
            type="button"
            onClick={() => onViewDetails(task)}
            className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-lg">⏵</span>
            View Details
          </button>
          {onUpdateStatus && !task.isCompleted && (
            <button
                type="button"
                className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
                onClick={() => {
                if (task.id) {
                    onUpdateStatus(task.id, true);
                }
                }}
            >
                <span className="text-lg">✓</span>
                Complete
            </button>
          )}
          {onUpdateStatus && task.isCompleted && (
            <button
              type="button"
              className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
              onClick={() => {
                if (task.id) {
                  onUpdateStatus(task.id, false);
                }
              }}
            >
              <span className="text-lg">↺</span>
              Undo Complete
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
}