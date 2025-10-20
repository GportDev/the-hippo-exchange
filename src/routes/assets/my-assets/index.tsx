import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import AddAssetModal from "@/components/AddAssetModal";
import { AssetCard } from "@/components/AssetCard";
import { EditAssetModal } from "@/components/EditAssetModal";
import { MyAssetsSkeleton } from "@/components/MyAssetsSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DollarSign, Heart, Package, Search } from "lucide-react";

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
			toast.success("Asset updated successfully!");
			setEditingAsset(null); // Close modal on success
		},
		onError: (error) => {
			toast.error(`Failed to update asset: ${error.message}`);
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
			toast.success("Asset deleted successfully!");
		},
		onError: (error) => {
			toast.error(`Failed to delete asset: ${error.message}`);
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
					`Failed to update asset: ${res.status} ${res.statusText} - ${errorText}`,
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
		deleteMutation.mutate(id);
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
		0,
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
            <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center justify-between md:flex-col md:items-start flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Total Assets</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-gray">{assets.length}</div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center justify-between md:flex-col md:items-start flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Total Value</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-gray">
                ${totalValue.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm flex items-center justify-between md:flex-col md:items-start flex-wrap">
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

						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm hover:shadow-lg transition-shadow">
							<div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10" />
							<DollarSign className="h-7 w-7 text-green-600 mb-2" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">
								Total Value
							</div>
							<div className="text-2xl font-bold text-primary-gray">
								${totalValue.toLocaleString()}
							</div>
						</div>

        {filteredAssets.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-primary-gray">
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
