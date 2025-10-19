import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { apiFetch } from "@/lib/api";
import type { Asset } from "@/lib/Types";
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

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId?: string;
}

export function AddMaintenanceModal({ isOpen, onClose, assetId }: AddMaintenanceModalProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const today = new Date().toISOString().split("T")[0];

  const [selectedAssetId, setSelectedAssetId] = useState(assetId || "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [toolLocation, setToolLocation] = useState("");
  const [requiredTools, setRequiredTools] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use localStorage to persist recurrence settings
  const [preserveFromPrior, setPreserveFromPrior] = useState(() => {
    const saved = localStorage.getItem("preserveFromPrior");
    return saved ? JSON.parse(saved) : false;
  });
  const [recurrenceInterval, setRecurrenceInterval] = useState(() => {
    const saved = localStorage.getItem("recurrenceInterval");
    return saved ? Number(JSON.parse(saved)) : 2;
  });
  const [recurrenceUnit, setRecurrenceUnit] = useState<'Days' | 'Weeks' | 'Months' | 'Years'>(() => {
    const saved = localStorage.getItem("recurrenceUnit");
    return saved ? JSON.parse(saved) : 'Weeks';
  });

  // Effects to save recurrence settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("preserveFromPrior", JSON.stringify(preserveFromPrior));
  }, [preserveFromPrior]);

  useEffect(() => {
    localStorage.setItem("recurrenceInterval", JSON.stringify(recurrenceInterval));
  }, [recurrenceInterval]);

  useEffect(() => {
    localStorage.setItem("recurrenceUnit", JSON.stringify(recurrenceUnit));
  }, [recurrenceUnit]);

  // Effect to sync state if assetId prop changes
  useEffect(() => {
    if (assetId) {
      setSelectedAssetId(assetId);
    }
  }, [assetId]);

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/assets");
    },
    enabled: !!user && isOpen && !assetId, // Only fetch if no specific asset is provided
  });

  // Fetch details for the currently selected asset
  const { data: selectedAsset } = useQuery<Asset>({
    queryKey: ["asset", selectedAssetId],
    queryFn: async () => {
      if (!user || !selectedAssetId) return null;
      return apiFetch(user.id, `/assets/${selectedAssetId}`);
    },
    enabled: !!user && !!selectedAssetId,
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedAssetId || !selectedAsset) throw new Error("Missing required information.");

      const newMaintenancePayload = {
        assetId: selectedAssetId,
        // Fields from selected asset
        brandName: selectedAsset.brandName,
        productName: selectedAsset.itemName,
        assetCategory: selectedAsset.category || "Electronics",
        costPaid: selectedAsset.purchaseCost,
        purchaseLocation: selectedAsset.purchaseLocation || undefined,
        
        // Fields from form state
        maintenanceTitle: title,
        maintenanceDescription: description,
        maintenanceDueDate: new Date(dueDate + 'T00:00:00').toISOString(),
        isCompleted,
        
        // Fields for recurrence
        preserveFromPrior,
        recurrenceInterval: preserveFromPrior ? recurrenceInterval : undefined,
        recurrenceUnit: preserveFromPrior ? recurrenceUnit : undefined,

        // Use state for tool location and required tools
        toolLocation: toolLocation,
        requiredTools: requiredTools.split(',').map(t => t.trim()).filter(Boolean),

        // Hardcoded or default values to satisfy backend validation
        maintenanceStatus: isCompleted ? "Completed" : "Upcoming",
      };

      // Clean the payload: remove any keys with null or empty string values
      const cleanedPayload = Object.fromEntries(
        Object.entries(newMaintenancePayload).filter(([_, v]) => v !== "" && v != null)
      );


      return apiFetch(user.id, `/assets/${selectedAssetId}/maintenance`, {
        method: "POST",
        body: JSON.stringify(cleanedPayload),
      });
    },
    onSuccess: () => {
      // Invalidate both general maintenance and specific asset maintenance queries
      queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
      if (assetId) {
        queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", assetId] });
      }
      onClose();
      // Reset form
      if (!assetId) { // Don't reset selectedAssetId if it's passed as a prop
        setSelectedAssetId("");
      }
      setTitle("");
      setDueDate("");
      setDescription("");
      setIsCompleted(false);
      setToolLocation("");
      setRequiredTools("");
      // Note: We no longer reset cost as it's derived from the asset
    },
    onError: (error) => {
      console.error("Failed to add maintenance:", error);
      // Here you could add a toast notification to inform the user
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (title.length < 2) {
      validationErrors.title = "Title must be at least 2 characters.";
    }
    if (toolLocation.length < 2) {
      validationErrors.toolLocation = "Tool location must be at least 2 characters.";
    }
    if (!dueDate) {
      validationErrors.dueDate = "Due date is required.";
    } else if (new Date(dueDate) < new Date(today)) {
      validationErrors.dueDate = "Due date cannot be in the past.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    addMaintenanceMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <DialogTitle className="text-center text-primary-yellow">Add New Maintenance Task</DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Select an asset and fill in the details for the new maintenance task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto px-6">
          <form onSubmit={handleSubmit} id="add-maintenance-form" className="space-y-6 py-6">
            {!assetId && (
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Select
                  value={selectedAssetId}
                  onValueChange={setSelectedAssetId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsLoading ? (
                      <SelectItem value="loading" disabled>Loading assets...</SelectItem>
                    ) : (
                      assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.itemName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAsset && (
              <div className="p-4 border rounded-md bg-gray-50/80 text-sm">
                <h4 className="font-semibold text-primary-gray mb-2">Asset Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <strong className="text-gray-500">Name:</strong>
                  <span>{selectedAsset.itemName}</span>
                  <strong className="text-gray-500">Brand:</strong>
                  <span>{selectedAsset.brandName}</span>
                  <strong className="text-gray-500">Category:</strong>
                  <span>{selectedAsset.category}</span>
                  <strong className="text-gray-500">Cost:</strong>
                  <span>${selectedAsset.purchaseCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Maintenance Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Oil Change, Filter Replacement"
                required
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={today}
                required
              />
              {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any relevant notes or instructions..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolLocation">Tool Location</Label>
              <Input
                id="toolLocation"
                value={toolLocation}
                onChange={(e) => setToolLocation(e.target.value)}
                placeholder="e.g., Garage, Shed, Toolbox"
              />
              {errors.toolLocation && <p className="text-sm text-red-500 mt-1">{errors.toolLocation}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredTools">Required Tools</Label>
              <Input
                id="requiredTools"
                value={requiredTools}
                onChange={(e) => setRequiredTools(e.target.value)}
                placeholder="e.g., Wrench, Screwdriver"
              />
              {errors.requiredTools && <p className="text-sm text-red-500 mt-1">{errors.requiredTools}</p>}
              <p className="text-xs text-gray-500">Separate multiple tools with a comma.</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="preserveFromPrior"
                checked={preserveFromPrior}
                onCheckedChange={(checked) =>
                  setPreserveFromPrior(checked as boolean)
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
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceUnit">Unit</Label>
                    <Select
                      value={recurrenceUnit}
                      onValueChange={(value) => setRecurrenceUnit(value as 'Days' | 'Weeks' | 'Months' | 'Years')}
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
          <Button type="submit" form="add-maintenance-form" disabled={addMaintenanceMutation.isPending}
            className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            {addMaintenanceMutation.isPending ? "Adding..." : "Add Maintenance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
