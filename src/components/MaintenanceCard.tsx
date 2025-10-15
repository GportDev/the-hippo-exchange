import { Badge } from "@/components/ui/badge";
import type { Maintenance } from "@/lib/Types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface MaintenanceCardProps {
  task: Maintenance;
  onUpdateStatus?: (maintenanceId: string, status: string) => void;
  onViewDetails: (task: Maintenance) => void;
  picture: string;
}

export function MaintenanceCard({
  task,
  onUpdateStatus,
  onViewDetails,
  picture,
}: MaintenanceCardProps) {
  const getStatusColor = () => {
    switch (task.maintenanceStatus) {
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="pr-2">
          <img
            src={picture || '/public/placeholder.jpg'}
            alt={task.productName}
            className="w-[150px] h-[150px] rounded-xl object-cover"
          />  
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-primary-gray">
              {task.productName}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
            >
              <Badge className={getStatusColor()}>
                {task.maintenanceStatus === "pending"
                  ? "Upcoming"
                  : task.maintenanceStatus.charAt(0).toUpperCase() +
                    task.maintenanceStatus.slice(1)}
              </Badge>
            </span>
          </div>
          <p className="text-gray-600 mb-2">{task.maintenanceTitle}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Due: {formatDate(task.maintenanceDueDate)}</span>
          </div>
        </div>
        <div className="ml-4 grid space-y-4 flex-shrink-0">
          {onUpdateStatus && task.maintenanceStatus !== "completed" && (
            <button
              type="button"
              className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer"
              onClick={() => onUpdateStatus(task.id, "completed")}
            >
              Mark Complete
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetails(task)}
            className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}