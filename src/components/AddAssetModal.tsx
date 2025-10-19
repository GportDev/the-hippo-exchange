import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
  const [status, setStatus] = useState("Available");
  const [favorite, setFavorite] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutation for uploading the image file
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated for upload.");
      const formData = new FormData();
      formData.append("file", file);

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
      // Reset form state after successful submission
      setItemName("");
      setBrandName("");
      setCategory("");
      setPurchaseDate("");
      setPurchaseCost(null);
      setCurrentLocation("");
      setConditionDescription("");
      setStatus("Available");
      setFavorite(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrors({});
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
          // Fallback chain: city -> town -> village -> county
          const city = data.address.city || data.address.town || data.address.village || data.address.county;
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

    const purchaseDateUTC = purchaseDate 
      ? `${purchaseDate}T00:00:00.000Z` 
      : new Date().toISOString();

    const newAsset: CreateAssetRequest = {
      itemName,
      brandName,
      category,
      purchaseDate: purchaseDateUTC,
      purchaseCost: purchaseCost ?? 0,
      currentLocation,
      images: imageUrl ? [imageUrl] : [],
      conditionDescription,
      status,
      favorite,
    };
    addAssetMutation.mutate(newAsset);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (itemName.length < 3) {
      newErrors.itemName = "Item name must be at least 3 characters long.";
    }
    if (brandName.length < 3) {
      newErrors.brandName = "Brand name must be at least 3 characters long.";
    }
    if (category.length < 3) {
      newErrors.category = "Category must be at least 3 characters long.";
    }
    if (!currentLocation) {
      newErrors.currentLocation = "Location is required.";
    } else if (currentLocation.length < 3) {
      newErrors.currentLocation = "Location must be at least 3 characters long.";
    }
    if (purchaseDate && new Date(purchaseDate) > new Date()) {
      newErrors.purchaseDate = "Purchase date cannot be in the future.";
    }
    // Add more validation rules here if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add an asset.");
      return;
    }

    if (!validateForm()) {
      // Find the first error and alert the user
      const firstErrorKey = Object.keys(errors).find(key => errors[key]);
      const firstErrorMessage = firstErrorKey ? errors[firstErrorKey] : "Please fix the errors before submitting.";
      // A more user-friendly approach would be to scroll to the field
      // and display the error message next to it.
      alert(firstErrorMessage);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
        className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors">
        Add New Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-[425px] max-h-[90vh] flex flex-col p-0">
        {/* Close Button */}
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-60"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg z-60">
          <DialogTitle className="text-center text-primary-yellow">Add New Asset</DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            Fill in the details for your new asset. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto px-6">
          <form onSubmit={handleSubmit} id="add-asset-form" className="space-y-6 py-6">

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Image</Label>
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
                    className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-100 p-6 text-center hover:border-gray-400 hover:bg-gray-100"
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

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="col-span-3"
                required
              />
              {errors.itemName && <p className="text-red-500 text-sm">{errors.itemName}</p>}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="col-span-3"
                required
              />
              {errors.brandName && <p className="text-red-500 text-sm">{errors.brandName}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3"
                required
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="col-span-3 cursor-text"
                required
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.purchaseDate && <p className="text-red-500 text-sm">{errors.purchaseDate}</p>}
            </div>

            {/* Purchase Cost */}
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={purchaseCost ?? ''} // Show empty string if state is null
                  onChange={(e) => setPurchaseCost(e.target.value === '' ? null : Number(e.target.value))}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Current Location */}
            <div className="space-y-2">
              <Label htmlFor="currentLocation">Location</Label>
              <div className="col-span-3 flex flex-col sm:flex-row items-center gap-2">
                <Input
                  id="currentLocation"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="flex-grow w-full"
                  placeholder="e.g., Detroit, MI"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="w-full sm:w-auto"
                >
                  {isFetchingLocation ? "Fetching..." : "Use My Location"}
                </Button>
              </div>
              {errors.currentLocation && <p className="text-red-500 text-sm">{errors.currentLocation}</p>}
            </div>

            {/* Condition Description */}
            <div className="space-y-2">
              <Label htmlFor="conditionDescription">Condition</Label>
              <Input
                id="conditionDescription"
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In_Repair">In Repair</SelectItem>
                  <SelectItem value="Unlisted">Unlisted</SelectItem>
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
                checked={favorite}
                onCheckedChange={(checked) => setFavorite(Boolean(checked))}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <Button type="submit" form="add-asset-form" disabled={isSaving}
          className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            {isSaving ? "Saving..." : "Save Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
