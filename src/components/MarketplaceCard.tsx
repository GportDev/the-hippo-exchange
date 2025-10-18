import type { Asset } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RequestBorrowModal } from "./RequestBorrowModal";

interface Props {
  asset: Asset;
}

export function MarketplaceCard({ asset }: Props) {
  const [open, setOpen] = useState(false);
  const image = asset.images?.[0];
  const owner = asset.ownerUserId?.slice(0, 6) ?? "user"; // anonymized owner placeholder

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-video bg-gray-100">
        {image ? (
          <img src={image} alt={asset.itemName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="text-xs text-gray-500">{asset.category}</div>
        <h3 className="text-lg font-semibold text-primary-gray">{asset.itemName}</h3>
        {asset.currentLocation && (
          <div className="text-sm text-gray-600">{asset.currentLocation}</div>
        )}
        <div className="text-xs text-gray-500">Owner: {owner}</div>
        <div className="mt-auto pt-2">
          <Button
            onClick={() => setOpen(true)}
            className="w-full bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            Request to Borrow
          </Button>
        </div>
      </div>

      <RequestBorrowModal open={open} onOpenChange={setOpen} asset={asset} />
    </div>
  );
}
