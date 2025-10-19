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
  const [toolsInput, setToolsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        maintenanceDueDate: task.maintenanceDueDate
          ? task.maintenanceDueDate.split("T")[0]
          : "",
      });
      // Handle both string and array formats for backward compatibility
      if (typeof task.requiredTools === 'string') {
        setToolsInput(task.requiredTools);
      } else if (Array.isArray(task.requiredTools)) {
        setToolsInput((task.requiredTools as string[]).join(", "));
      } else {
        setToolsInput("");
      }
      setErrors({});
    }
  }, [task]);

  if (!task) return null;
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value === '' ? undefined : Number(value) }));
  };

  const handleSelectChange = (id: keyof Maintenance | 'requiredToolsString', value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const {
    maintenanceTitle = "",
    maintenanceDescription = "",
    maintenanceDueDate = "",
    costPaid,
    toolLocation = "",
    isCompleted = false,
    preserveFromPrior = false,
    recurrenceInterval,
    recurrenceUnit = 'Weeks',
  } = formData;

  const handleSave = () => {
    const validationErrors: Record<string, string> = {};

    if (!maintenanceTitle || maintenanceTitle.length < 2) {
      validationErrors.maintenanceTitle = "Title must be at least 2 characters.";
    }
    if ((costPaid ?? 0) < 0.01 && costPaid !== 0) {
      validationErrors.costPaid = "Cost must be $0.00 or greater.";
    }
    if (!toolLocation || toolLocation.length < 2) {
      validationErrors.toolLocation = "Tool location must be at least 2 characters.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    // Create a new Date object from the dueDate string
    const date = new Date(maintenanceDueDate + "T00:00:00");

    // Format the date to ISO 8601 format in UTC
    const isoDate = date.toISOString();
    const updatedTask: Maintenance = {
      ...task,
      maintenanceTitle,
      maintenanceDescription,
      maintenanceDueDate: isoDate,
      isCompleted,
      preserveFromPrior,
      requiredTools: toolsInput.split(',').map(tool => tool.trim()).filter(Boolean),
      id: task.id,
      assetId: task.assetId,
      brandName: task.brandName,
      productName: task.productName,
      assetCategory: task.assetCategory || "Electronics", // Provide a valid default category
      purchaseLocation: task.purchaseLocation || undefined,
      maintenanceStatus: isCompleted ? "Completed" : (task.maintenanceStatus || "Upcoming"),
    };
    
    if (preserveFromPrior === false) {
      updatedTask.recurrenceInterval = undefined;
      updatedTask.recurrenceUnit = undefined;
    } else {
      // Ensure recurrence fields have valid values when preserveFromPrior is true
      if (preserveFromPrior === true) {
        updatedTask.recurrenceInterval = recurrenceInterval ?? task.recurrenceInterval ?? 2;
        updatedTask.recurrenceUnit = recurrenceUnit ?? task.recurrenceUnit ?? 'Weeks';
        
        // Validate that recurrenceInterval is not null when preserveFromPrior is true
        if (updatedTask.recurrenceInterval === null || updatedTask.recurrenceInterval === undefined) {
          updatedTask.recurrenceInterval = 2;
        }
      }
    }

    // Remove any extra fields that shouldn't be in the API payload
    delete (updatedTask as any).status;

    // Validate JSON stringification
    try {
      JSON.stringify(updatedTask);
    } catch (error) {
      console.error("JSON stringification failed:", error);
      console.error("Problematic data:", updatedTask);
      return;
    }

    onSave(updatedTask);
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-50"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-center text-primary-yellow">Edit Maintenance Task</DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Update the details for the maintenance task.
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
                value={maintenanceTitle}
                onChange={handleChange}
              />
              {errors.maintenanceTitle && <p className="text-sm text-red-500 mt-1">{errors.maintenanceTitle}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceDueDate">Due Date</Label>
                <Input
                  id="maintenanceDueDate"
                  type="date"
                  value={maintenanceDueDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPaid">Cost</Label>
                <Input
                  id="costPaid"
                  type="number"
                  value={costPaid ?? ''}
                  onChange={handleNumberChange}
                  placeholder="e.g. 29.99"
                />
                {errors.costPaid && <p className="text-sm text-red-500 mt-1">{errors.costPaid}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isCompleted"
                checked={isCompleted}
                onCheckedChange={(checked) =>
                  handleSelectChange("isCompleted", checked as boolean)
                }
              />
              <label
                htmlFor="isCompleted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Is Completed
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceDescription">Description</Label>
              <Textarea
                id="maintenanceDescription"
                value={maintenanceDescription}
                onChange={handleChange}
                placeholder="Add any relevant notes or instructions..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toolLocation">Tool Location</Label>
              <Input
                id="toolLocation"
                value={toolLocation}
                onChange={handleChange}
                placeholder="e.g. Garage, Shed"
              />
              {errors.toolLocation && <p className="text-sm text-red-500 mt-1">{errors.toolLocation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredTools">Required Tools</Label>
              <Input
                id="requiredTools"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                placeholder="e.g., Wrench, Screwdriver"
              />
              {errors.requiredTools && (
                <p className="text-sm text-red-500 mt-1">{errors.requiredTools}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="preserveFromPrior"
                checked={preserveFromPrior}
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

            {preserveFromPrior && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50/50">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceInterval">Repeat Every</Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    value={recurrenceInterval ?? 2}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrenceUnit">Unit</Label>
                  <Select
                    value={recurrenceUnit}
                    onValueChange={(value) => handleSelectChange('recurrenceUnit', value as 'Days' | 'Weeks' | 'Months' | 'Years')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Days">Days</SelectItem>
                      <SelectItem value="Weeks">Weeks</SelectItem>
                      <SelectItem value="Months">Months</SelectItem>
                      <SelectItem value="Years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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