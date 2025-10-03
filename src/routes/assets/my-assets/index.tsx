import AssetCard from "@/components/AssetCard";
import AddAssetModal from "@/components/AddAssetModal";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";

export const Route = createFileRoute("/assets/my-assets/")({
  component: MyAssetsPage,
});

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
  status: string;
}

function MyAssetsPage() {
  const { user } = useUser();
  const {
    data: assets,
    isLoading,
    error,
  } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      const res = await fetch(`${API_BASE_URL}/assets`, {
        headers: {
          "X-User-Id": user.id,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch assets");
      }
      return res.json();
    },
    enabled: !!user,
  });

  return (
    <section className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Assets</h1>
        <AddAssetModal />
      </div>
      {isLoading && <p>Loading assets...</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {assets?.map((asset) => (
          <AssetCard
            key={asset.id}
            itemName={asset.itemName}
            brandName={asset.brandName}
            category={asset.category}
            purchaseDate={asset.purchaseDate}
            purchaseCost={asset.purchaseCost}
            currentLocation={asset.currentLocation}
            images={asset.images}
            conditionDescription={asset.conditionDescription}
            status={asset.status}
            link={`/assets/my-assets/${asset.id}`}
          />
        ))}
      </div>
    </section>
  );
}