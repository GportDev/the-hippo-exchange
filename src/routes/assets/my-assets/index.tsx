import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useApiClient } from "@/hooks/useApiClient";
import { optimizeImageUrl } from "@/lib/images";

import AddAssetModal from "@/components/AddAssetModal";
import { EditAssetModal } from "@/components/EditAssetModal";
import { AssetCard } from "@/components/AssetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Heart, DollarSign, ArrowRight, Clock, ClipboardList, ShieldCheck } from "lucide-react";
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
  const apiClient = useApiClient();

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await apiClient<Asset[]>("/assets");
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
      await apiClient(`/assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(assetData),
        skipJsonParsing: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
      setEditingAsset(null); // Close modal on success
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      if (!user) throw new Error("User not authenticated");
      await apiClient(`/assets/${assetId}`, {
        method: "DELETE",
        skipJsonParsing: true,
      });
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
      await apiClient(`/assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(assetData),
        skipJsonParsing: true,
      });
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
  const availableAssets = assets.filter((asset) => asset.status === "available").length;
  const showcaseAsset = assets[0] ?? null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const heroStats = [
    {
      label: "Total Listings",
      value: assets.length.toString(),
      description: "Items you currently have available to lend",
      Icon: Package,
      accent: "from-blue-500/25 to-blue-500/5",
      iconColor: "text-blue-200",
    },
    {
      label: "Ready to Lend",
      value: availableAssets.toString(),
      description: "Assets marked as available for borrowers",
      Icon: Heart,
      accent: "from-emerald-500/25 to-emerald-500/5",
      iconColor: "text-emerald-200",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(totalValue),
      description: "Replacement value of your lending inventory",
      Icon: DollarSign,
      accent: "from-purple-500/25 to-purple-500/5",
      iconColor: "text-purple-200",
    },
  ];

  const heroFeatures = [
    {
      title: "Define lending terms",
      description: "Set borrowing windows, deposits, and return conditions for every listing.",
      Icon: Clock,
    },
    {
      title: "Attach maintenance tasks",
      description: "Add checklists borrowers must complete before returning your equipment.",
      Icon: ClipboardList,
    },
    {
      title: "Protect your gear",
      description: "Track lending history, mark favorites, and keep maintenance records synced.",
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl rounded-b-[50%] bg-primary-yellow/20 blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-primary-yellow/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-160px] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary-yellow/10 blur-[120px]" />
        <PageContainer as="div" className="relative space-y-12 pt-10">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-primary-yellow/25 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
              </div>
              <div className="relative grid gap-12 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                      Manage your lending fleet
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        Share gear with confidence
                      </h1>
                      <p className="max-w-xl text-base text-white/70 sm:text-lg">
                        Track the assets you lend, define borrowing rules, and keep maintenance schedules in lockstep with every loan.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <AddAssetModal />
                    <Link
                      to="/home"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
                    >
                      Explore community gear
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {heroStats.map(({ label, value, Icon, accent, iconColor, description }) => (
                      <div
                        key={label}
                        className={`group gradient-border rounded-2xl border border-white/5 bg-gradient-to-br ${accent} p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl`}
                      >
                        <div className="rounded-2xl bg-slate-950/60 p-5 backdrop-blur">
                          <div className={`mb-3 inline-flex rounded-full bg-white/10 p-2 ${iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.4em] text-white/60">{label}</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                          <p className="mt-2 text-xs text-white/60">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {heroFeatures.map(({ title, description, Icon }) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-3 inline-flex rounded-full bg-white/10 p-2 text-primary-yellow">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs text-white/60">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative animate-scale-in">
                    <div className="absolute -inset-10 rounded-[2.75rem] bg-primary-yellow/20 blur-[100px]" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-xl backdrop-glow">
                      {showcaseAsset?.images?.[0] ? (
                        <img
                          src={optimizeImageUrl(showcaseAsset.images[0], 900)}
                          alt={showcaseAsset.itemName}
                          className="block h-auto w-full max-w-lg animate-fade-up transition duration-500 hover:-translate-y-1 hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-80 w-[28rem] items-center justify-center text-white/60">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    {showcaseAsset && (
                      <div className="absolute -bottom-7 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Featured Asset</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-lg font-semibold text-white">{showcaseAsset.itemName}</p>
                            <p className="text-sm text-white/70">{showcaseAsset.brandName ?? "Unbranded"}</p>
                          </div>
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                            {showcaseAsset.currentLocation || "Location TBD"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="relative w-full flex-1 min-w-[260px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      placeholder="Search assets by name, brand, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full cursor-pointer border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:ring-primary-yellow sm:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_repair">In Repair</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex w-full items-center justify-center gap-2 border-white/30 bg-white/5 text-white transition hover:border-primary-yellow/40 hover:bg-white/10 sm:w-auto ${
                      showFavoritesOnly ? "border-primary-yellow/60 bg-primary-yellow/10 text-primary-yellow" : ""
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        showFavoritesOnly ? "fill-current" : ""
                      }`}
                    />
                    Favorites
                  </Button>
                </div>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center text-white/70 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                  <Package className="mx-auto mb-4 h-12 w-12 text-white/40" />
                  <h3 className="text-xl font-semibold text-white">{assets.length > 0 ? "No assets match your filters" : "Start sharing your first asset"}</h3>
                  <p className="mt-2 text-sm text-white/60">
                    {assets.length > 0
                      ? "Adjust your filters to uncover more of your inventory."
                      : "Add a listing to begin lending gear to the community."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            </section>
        </PageContainer>
      </main>
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
