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

  const [selectedAssetId, setSelectedAssetId] = useState(assetId || "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [preserveFromPrior, setPreserveFromPrior] = useState(false);
  const [requiredTools, setRequiredTools] = useState("");
  const [toolLocation, setToolLocation] = useState("");

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

  const { data: singleAsset } = useQuery<Asset>({
    queryKey: ["assets", assetId],
    queryFn: async () => {
      if (!user || !assetId) throw new Error("Missing user or assetId");
      return apiFetch(user.id, `/assets/${assetId}`);
    },
    enabled: !!user && isOpen && !!assetId,
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedAssetId) throw new Error("Missing required information.");

      const asset = assetId ? singleAsset : assets.find((a) => a.id === selectedAssetId);
      if (!asset) throw new Error("Selected asset not found.");

      const newMaintenance = {
        assetId: selectedAssetId,
        brandName: asset.brandName,
        productName: asset.itemName,
        purchaseLocation: asset.currentLocation,
        costPaid: asset.purchaseCost,
        maintenanceTitle: title,
        maintenanceDescription: description,
        maintenanceDueDate: new Date(dueDate).toISOString(),
        maintenanceStatus: status,
        preserveFromPrior: preserveFromPrior,
        requiredTools: requiredTools.split(",").map((t) => t.trim()),
        toolLocation: toolLocation,
      };

      return apiFetch(user.id, `/assets/${selectedAssetId}/maintenance`, {
        method: "POST",
        body: JSON.stringify(newMaintenance),
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
      setStatus("pending");
      setPreserveFromPrior(false);
      setRequiredTools("");
      setToolLocation("");
    },
    onError: (error) => {
      console.error("Failed to add maintenance:", error);
      // Here you could add a toast notification to inform the user
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredTools">Required Tools</Label>
                <Input
                  id="requiredTools"
                  value={requiredTools}
                  onChange={(e) => setRequiredTools(e.target.value)}
                  placeholder="Comma-separated tools"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toolLocation">Tool Location</Label>
                <Input
                  id="toolLocation"
                  value={toolLocation}
                  onChange={(e) => setToolLocation(e.target.value)}
                />
              </div>
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
