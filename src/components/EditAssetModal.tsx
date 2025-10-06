import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This interface must match the one in your `my-assets/index.tsx`
interface Asset {
  id: string;
  itemName: string;
  brandName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  currentLocation: string;
  images: string[];
  conditionDescription: string;
  ownerUserId: string;
  status: string;
  favorite: boolean;
}

interface EditAssetModalProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedAsset: Asset) => void;
  isSaving: boolean;
}

export function EditAssetModal({
  asset,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: EditAssetModalProps) {
  // State for all form fields, initialized from the asset prop
  const [formData, setFormData] = useState<Asset>(asset);

  // Effect to update form data if the asset prop changes
  useEffect(() => {
    setFormData(asset);
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };


  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value === '' ? 0 : Number(value) }));
  };

  const handleCheckboxChange = (id: keyof Asset, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Format date for the input type="date"
  const purchaseDateForInput = new Date(formData.purchaseDate).toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0">
        {/* Close Button */}
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        {/* Header */}
        <DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-center text-primary-yellow">Edit Asset</DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Update the details for your asset. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto px-6">
          <form onSubmit={handleSubmit} id="edit-asset-form" className="space-y-6 py-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDateForInput}
                onChange={handleChange}
                required
              />
            </div>

            {/* Purchase Cost */}
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchaseCost}
                  onChange={handleNumberChange}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="currentLocation">Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                placeholder="e.g., Detroit, MI"
              />
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="conditionDescription">Condition</Label>
              <Input
                id="conditionDescription"
                value={formData.conditionDescription}
                onChange={handleChange}
                placeholder="e.g., Like New"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="in_repair">In Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Favorite */}
            <div className="flex items-center space-x-2 pt-4">
              <Label htmlFor="favorite" className="cursor-pointer">
                Favorite
              </Label>
              <Checkbox
                id="favorite"
                checked={formData.favorite}
                onCheckedChange={(checked) => handleCheckboxChange("favorite", Boolean(checked))}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <Button 
            type="submit" 
            form="edit-asset-form" 
            disabled={isSaving} 
            className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}