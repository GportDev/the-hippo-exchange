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
import { Checkbox } from "@/components/ui/checkbox";


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
  ownerUserId: string;
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
  const [purchaseDate, setPurchaseDate] = useState("");
  const [image, setImage] = useState(""); // For a single image URL
  const [status, setStatus] = useState("available");
  const [favorite, setFavorite] = useState(false);

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
    if (!user) {
      // This check ensures the user is logged in before proceeding.
      // It satisfies TypeScript and prevents runtime errors.
      alert("You must be logged in to add an asset.");
      return;
    }
    const newAsset: CreateAssetRequest = {
      itemName,
      brandName,
      category,
      purchaseDate: new Date(purchaseDate).toISOString(),
      purchaseCost: Number(purchaseCost),
      currentLocation,
      images: image ? [image] : [], // Send image in an array
      conditionDescription,
      ownerUserId: user.id,
      status,
      favorite,
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
              <Label htmlFor="purchaseDate" className="text-right">
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
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
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="col-span-3"
                placeholder="http://example.com/image.jpg"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="in_repair">In Repair</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="favorite" className="text-right">
                Favorite
              </Label>
              <Checkbox
                id="favorite"
                checked={favorite}
                onCheckedChange={(checked) => setFavorite(Boolean(checked))}
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

