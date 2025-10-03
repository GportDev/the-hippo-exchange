import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// This interface should match the expected JSON body structure
interface CreateAssetRequest {
  itemName: string;
  brandName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  currentLocation: string;
  images: string[];
  conditionDescription: string;
  status: string;
  favorite: boolean;
}

export default function AddAssetModal() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Corresponds to the CreateAssetRequest model
  const [itemName, setItemName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseCost, setPurchaseCost] = useState(0);
  const [currentLocation, setCurrentLocation] = useState("");
  const [conditionDescription, setConditionDescription] = useState("");

  const addAssetMutation = useMutation({
    mutationFn: async (newAsset: CreateAssetRequest) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await fetch(`${API_BASE_URL}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify(newAsset),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to create asset: ${res.status} ${res.statusText} - ${errorText}`,
        );
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the assets query to show the new asset
      queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
      setOpen(false); // Close the modal on success
      // You could also add a success toast notification here
    },
    onError: (error) => {
      // You can handle errors here, e.g., show a toast notification
      console.error("Error creating asset:", error);
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: CreateAssetRequest = {
      itemName,
      brandName,
      category,
      // Using current date as a placeholder for purchaseDate
      purchaseDate: new Date().toISOString(),
      purchaseCost: Number(purchaseCost),
      currentLocation,
      // Placeholder values for fields not in the form
      images: ["http://example.com/image.jpg"],
      conditionDescription,
      status: "available",
      favorite: false,
    };
    addAssetMutation.mutate(newAsset);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Fill in the details for your new asset. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right">
                Item Name
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandName" className="text-right">
                Brand
              </Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseCost" className="text-right">
                Cost
              </Label>
              <Input
                id="purchaseCost"
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentLocation" className="text-right">
                Location
              </Label>
              <Input
                id="currentLocation"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conditionDescription" className="text-right">
                Condition
              </Label>
              <Input
                id="conditionDescription"
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addAssetMutation.isPending}>
              {addAssetMutation.isPending ? "Saving..." : "Save Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

