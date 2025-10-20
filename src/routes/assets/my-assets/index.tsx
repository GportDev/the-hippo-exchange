import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { API_BASE_URL } from "@/lib/api";

import AddAssetModal from "@/components/AddAssetModal";
import { EditAssetModal } from "@/components/EditAssetModal";
import { AssetCard } from "@/components/AssetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Heart, DollarSign } from "lucide-react";
import { MyAssetsSkeleton } from "@/components/MyAssetsSkeleton";

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

export const Route = createFileRoute("/assets/my-assets/")({
  component: MyAssetsComponent,
});

function MyAssetsComponent() {
  const { user, isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE_URL}/assets`, {
        headers: { "X-User-Id": user.id },
      });
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      // Normalize status values coming from the API so UI mapping is consistent.
      // Convert values like "In Repair" or "in-repair" to "in_repair".
      if (Array.isArray(data)) {
        return data.map((asset: Asset) => ({
          ...asset,
          status: String(asset.status).replace(/[-\s]/g, "_").toLowerCase(),
        }));
      }
      return data;
    },
    enabled: !!user,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (updatedAsset: Asset) => {
      if (!user) throw new Error("User not authenticated");
      const { id, ...assetData } = updatedAsset;
      const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify(assetData),
      });
      if (!res.ok) {
        throw new Error("Failed to update asset");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
      setEditingAsset(null); // Close modal on success
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
        method: "DELETE",
        headers: { "X-User-Id": user.id },
      });
      if (!res.ok) throw new Error("Failed to delete asset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (updatedAsset: Asset) => {
      if (!user) throw new Error("User not authenticated");
      // The API expects the full asset object on PUT, but without the ID in the body.
      const { id, ...assetData } = updatedAsset;
      const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify(assetData),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to update asset: ${res.status} ${res.statusText} - ${errorText}`
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
    },
  });

  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isLoaded || isLoadingAssets) {
    return <MyAssetsSkeleton />;
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    const assetToUpdate = assets.find((asset) => asset.id === id);
    if (assetToUpdate) {
      // Create a new object with the updated favorite status
      const updatedAsset = { ...assetToUpdate, favorite: isFavorite };
      favoriteMutation.mutate(updatedAsset);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;
    const matchesFavorites = !showFavoritesOnly || asset.favorite;
    return matchesSearch && matchesStatus && matchesFavorites;
  });

  const totalValue = assets.reduce(
    (sum, asset) => sum + (asset.purchaseCost || 0),
    0
  );

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-gray">My Assets</h1>
              <p className="text-muted-foreground">
                Manage and track your valuable assets.
              </p>
            </div>
            <AddAssetModal />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Total Assets</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-gray">{assets.length}</div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Total Value</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-gray">
                ${totalValue.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Heart className="h-5 w-5 text-red-600" />
                <span>Favorites</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-gray">
                {assets.filter((a) => a.favorite).length}
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets by name, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_repair">In Repair</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? "secondary" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2 text-primary-gray cursor-pointer"
            >
              <Heart
                className={`h-4 w-4 ${
                  showFavoritesOnly ? "fill-red-500 text-red-500" : ""
                }`}
              />
              Favorites
            </Button>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-primary-gray">
              No assets found
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {assets.length > 0
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first asset."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={handleDeleteAsset}
                onToggleFavorite={handleToggleFavorite}
                onEdit={() => handleEditAsset(asset)}
              />
            ))}
          </div>
        )}
        </div>
      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setEditingAsset(null);
            }
          }}
          onSave={updateMutation.mutate}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
}