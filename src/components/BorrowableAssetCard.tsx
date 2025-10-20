import { useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { optimizeImageUrl } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { RequestBorrowModal } from "@/components/RequestBorrowModal";

export interface BorrowableAssetCardProps {
  id: string;
  itemName: string;
  brandName?: string | null;
  images?: string[] | null;
  currentLocation?: string | null;
  status?: string | null;
  availabilityText?: string;
  canRequest?: boolean;
}

export function BorrowableAssetCard({
  id,
  itemName,
  brandName,
  images,
  currentLocation,
  status,
  availabilityText,
  canRequest = true,
}: BorrowableAssetCardProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_70px_-40px_rgba(15,23,42,0.9)] transition hover:border-primary-yellow/50 hover:bg-white/10">
      <div className="relative h-52 w-full overflow-hidden">
        {images?.[0] ? (
          <img
            src={optimizeImageUrl(images[0], 800)}
            alt={itemName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900/40 text-white/40">
            No photo yet
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
          Ready to borrow
        </div>
      </div>
      <div className="space-y-4 px-6 pb-6 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Featured gear</p>
            <h3 className="text-xl font-semibold text-white">{itemName}</h3>
            <p className="text-sm text-white/60">{brandName ?? "Community shared"}</p>
          </div>
          {status && (
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
              {status}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {availabilityText ?? "Reserve instantly"}
          </span>
          {currentLocation && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {currentLocation}
            </span>
          )}
        </div>
        {canRequest && (
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full justify-center bg-primary-yellow/90 text-slate-900 transition hover:bg-primary-yellow"
          >
            Request to borrow
          </Button>
        )}
      </div>
      {canRequest && (
        <RequestBorrowModal
          assetId={id}
          assetName={itemName}
          open={isModalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
