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
import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, X } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for all form fields
  const [itemName, setItemName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseCost, setPurchaseCost] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conditionDescription, setConditionDescription] = useState("");
  const [status, setStatus] = useState("available");
  const [favorite, setFavorite] = useState(false);

  // Mutation for uploading the image file
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated for upload.");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/assets/upload-image`, {
        method: "POST",
        headers: {
          "X-User-Id": user.id,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Image upload failed.");
      }
      // Assuming the API returns { "url": "..." }
      return (await res.json()) as { url: string };
    },
  });

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

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap's free reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch address.");
          }
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village;
          const state = data.address.state;
          if (city && state) {
            setCurrentLocation(`${city}, ${state}`);
          } else {
            alert("Could not determine a valid location.");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          alert("Failed to retrieve location address.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(`Error getting location: ${error.message}`);
        setIsFetchingLocation(false);
      },
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const createAsset = (imageUrl: string) => {
    if (!user) return;

    const newAsset: CreateAssetRequest = {
      itemName,
      brandName,
      category,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
      purchaseCost: purchaseCost ?? 0,
      currentLocation,
      images: imageUrl ? [imageUrl] : [],
      conditionDescription,
      ownerUserId: user.id,
      status,
      favorite,
    };
    addAssetMutation.mutate(newAsset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add an asset.");
      return;
    }

    if (selectedFile) {
      try {
        const { url } = await uploadImageMutation.mutateAsync(selectedFile);
        createAsset(url);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Could not upload image. Please try again.");
      }
    } else {
      // Create asset without an image or with a manually entered URL (if you keep that option)
      createAsset("");
    }
  };

  const isSaving = uploadImageMutation.isPending || addAssetMutation.isPending;

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
                required
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
                required
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseCost" className="text-right">
                Cost
              </Label>
              <div className="col-span-3 flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="pl-3 pr-2 text-muted-foreground">$</span>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={purchaseCost ?? ''} // Show empty string if state is null
                  onChange={(e) => setPurchaseCost(e.target.value === '' ? null : Number(e.target.value))}
                  className="h-full w-full border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentLocation" className="text-right">
                Location
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="currentLocation"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="flex-grow"
                  placeholder="e.g., Detroit, MI"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                >
                  {isFetchingLocation ? "Fetching..." : "Use My Location"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Image</Label>
              <div className="col-span-3">
                <Input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/gif"
                />
                {!previewUrl ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-gray-400 hover:bg-gray-100"
                  >
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">
                      Click to upload an image
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="h-auto w-full rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Asset"}
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
}

