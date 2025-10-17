import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Maintenance } from "@/lib/Types";
import { X, Trash2, Edit } from "lucide-react";

type MaintenanceStatus = "overdue" | "pending" | "completed";

interface MaintenanceDetailsModalProps {
  task: (Maintenance & { status: MaintenanceStatus }) | null;
  onClose: () => void;
  onEdit: (task: Maintenance & { status: MaintenanceStatus }) => void;
  onDelete: (taskId: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function MaintenanceDetailsModal({
  task,
  onClose,
  onEdit,
  onDelete,
}: MaintenanceDetailsModalProps) {
  if (!task) return null;

  const recurrenceUnitString = task.recurrenceUnit || "";

  const handleDelete = () => {
    if (
      task.id &&
      window.confirm(
        "Are you sure you want to delete this maintenance record? This action cannot be undone."
      )
    ) {
      onDelete(task.id);
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-center text-primary-yellow text-2xl">
            {task.maintenanceTitle}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Maintenance Details
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 text-sm">
          {/* General Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
              Task Info
            </h3>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 items-center">
              <strong className="text-gray-500">Status:</strong>
              <span className="capitalize font-medium">{task.status}</span>

              <strong className="text-gray-500">Due Date:</strong>
              <span>{formatDate(task.maintenanceDueDate)}</span>

              <strong className="text-gray-500">Cost:</strong>
              <span>{`$${task.costPaid.toFixed(2)}`}</span>
            </div>
          </div>

          {/* Asset & Tools Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
              Asset & Tools
            </h3>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 items-center">
              <strong className="text-gray-500">Product:</strong>
              <span>{task.productName}</span>

              <strong className="text-gray-500">Brand:</strong>
              <span>{task.brandName}</span>

              <strong className="text-gray-500">Tool Location:</strong>
              <span>{task.toolLocation || "N/A"}</span>
            </div>
          </div>

          {task.maintenanceDescription && (
            <div>
              <strong className="text-gray-500 mb-1 block">
                Description:
              </strong>
              <p className="bg-gray-50 p-3 rounded-md border text-gray-800">
                {task.maintenanceDescription}
              </p>
            </div>
          )}

          {task.requiredTools && task.requiredTools.length > 0 && (
            <div>
              <strong className="text-gray-500 mb-1 block">
                Required Tools:
              </strong>
              <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md border text-gray-800">
                {task.requiredTools.map((tool: string, index: number) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </div>
          )}

          {task.preserveFromPrior &&
            task.recurrenceInterval &&
            recurrenceUnitString && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
                  Recurrence
                </h3>
                <p className="bg-gray-50 p-3 rounded-md border text-gray-800">{`Repeats every ${task.recurrenceInterval} ${recurrenceUnitString}`}</p>
              </div>
            )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t px-6 py-4 flex justify-between w-full">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-800 hover:bg-red-900"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit(task)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <DialogClose asChild>
              <Button onClick={onClose}>Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}