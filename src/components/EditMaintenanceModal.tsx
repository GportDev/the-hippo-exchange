import { useState, useEffect } from "react";
import type { Maintenance } from "@/lib/Types";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditMaintenanceModalProps {
  task: Maintenance | null;
  onClose: () => void;
  onSave: (updatedTask: Maintenance) => void;
}

export function EditMaintenanceModal({
  task,
  onClose,
  onSave,
}: EditMaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<Maintenance>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        maintenanceDueDate: task.maintenanceDueDate
          ? new Date(task.maintenanceDueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [task]);

  if (!task) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof Maintenance, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const updatedTask = {
      ...task,
      ...formData,
      maintenanceDueDate: formData.maintenanceDueDate
        ? new Date(formData.maintenanceDueDate).toISOString()
        : task.maintenanceDueDate,
    } as Maintenance;
    onSave(updatedTask);
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-center text-primary-yellow">Edit Maintenance Task</DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Update the details for {task.productName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6">
          <form
            id="edit-maintenance-form"
            className="space-y-6 py-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="maintenanceTitle">Title</Label>
              <Input
                id="maintenanceTitle"
                value={formData.maintenanceTitle || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceDueDate">Due Date</Label>
                <Input
                  id="maintenanceDueDate"
                  type="date"
                  value={formData.maintenanceDueDate || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceStatus">Status</Label>
                <Select
                  value={formData.maintenanceStatus || ""}
                  onValueChange={(value) =>
                    handleSelectChange("maintenanceStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceDescription">Description</Label>
              <Textarea
                id="maintenanceDescription"
                value={formData.maintenanceDescription || ""}
                onChange={handleChange}
                placeholder="Add any relevant notes or instructions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredTools">Required Tools</Label>
                <Input
                  id="requiredTools"
                  value={
                    Array.isArray(formData.requiredTools)
                      ? formData.requiredTools.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    handleSelectChange(
                      "requiredTools",
                      e.target.value.split(",").map((t) => t.trim())
                    )
                  }
                  placeholder="Comma-separated tools"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toolLocation">Tool Location</Label>
                <Input
                  id="toolLocation"
                  value={formData.toolLocation || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="preserveFromPrior"
                checked={formData.preserveFromPrior}
                onCheckedChange={(checked) =>
                  handleSelectChange("preserveFromPrior", checked as boolean)
                }
              />
              <label
                htmlFor="preserveFromPrior"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Preserve for future recurrence
              </label>
            </div>
          </form>
        </div>
        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <Button type="submit" form="edit-maintenance-form"
            className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
