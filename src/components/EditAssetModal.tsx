import { Button } from "@/components/ui/button";
import {
  Dialog,
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-primary-gray">Edit Asset</DialogTitle>
          <DialogDescription>
            Update the details for your asset. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          <form onSubmit={handleSubmit} id="edit-asset-form" className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right text-primary-gray">
                Item Name
              </Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandName" className="text-right text-primary-gray">
                Brand
              </Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-primary-gray">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseDate" className="text-left text-primary-gray">
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDateForInput}
                onChange={handleChange}
                className="col-span-3 cursor-pointer"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseCost" className="text-right text-primary-gray">
                Cost
              </Label>
              <div className="col-span-3 flex h-10 w-full items-center rounded-md border border-input bg-background text-sm">
                <span className="pl-3 pr-2 text-muted-foreground">$</span>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={formData.purchaseCost}
                  onChange={handleNumberChange}
                  className="h-full w-full border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentLocation" className="text-right text-primary-gray">
                Location
              </Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                className="col-span-3"
                placeholder="e.g., Detroit, MI"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conditionDescription" className="text-right text-primary-gray">
                Condition
              </Label>
              <Input
                id="conditionDescription"
                value={formData.conditionDescription}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-primary-gray">
                Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="cursor-pointer col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="available">Available</option>
                <option value="in_repair">In Repair</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="favorite" className="text-right text-primary-gray">
                Favorite
              </Label>
              <Checkbox
                id="favorite"
                className={`cursor-pointer ${formData.favorite ? "bg-gray-400" : "bg-transparent"}`}
                checked={formData.favorite}
                onCheckedChange={(checked) => handleCheckboxChange("favorite", Boolean(checked))}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button type="submit" form="edit-asset-form" disabled={isSaving} className="text-primary-yellow bg-primary-gray cursor-pointer">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}