import type { BorrowRequest } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Calendar, User, MessageSquare, Package } from "lucide-react";

interface Props {
  request: BorrowRequest;
  mode: "sent" | "received";
}

export function RequestCard({ request, mode }: Props) {
  const { user } = useUser();
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}/approve`, { method: "PUT" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
  const deny = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}/deny`, { method: "PUT" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
  const cancelReq = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });

  const statusBadge = (
    <Badge
      className={{
        pending: "bg-yellow-100 text-yellow-800 border-transparent",
        approved: "bg-green-100 text-green-800 border-transparent",
        denied: "bg-red-100 text-red-800 border-transparent",
        cancelled: "bg-gray-100 text-gray-800 border-transparent",
      }[request.status]}
      variant="outline"
    >
      {request.status}
    </Badge>
  );

  const counterpartLabel = mode === "sent" ? `To: ${shortId(request.ownerId)}` : `From: ${shortId(request.requesterId)}`;
  const image = request.asset?.images?.[0];

  return (
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border">
        {image ? (
          <img src={image} alt={request.asset?.itemName ?? "Asset"} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-gray-500">{request.asset?.category ?? "Item"}</div>
            <div className="font-semibold text-primary-gray truncate">{request.asset?.itemName ?? request.assetId}</div>
          </div>
          <div className="flex-shrink-0">{statusBadge}</div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{counterpartLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(request.proposedStartDate).toLocaleDateString()} - {new Date(request.proposedEndDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {request.message && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400" />
            <p className="line-clamp-2">“{request.message}”</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 items-end justify-center">
        {mode === "received" && request.status === "pending" && (
          <>
            <Button onClick={() => approve.mutate()} disabled={approve.isPending} className="bg-green-600 hover:bg-green-700 text-white">
              {approve.isPending ? "Approving..." : "Approve"}
            </Button>
            <Button onClick={() => deny.mutate()} variant="destructive" disabled={deny.isPending}>
              {deny.isPending ? "Denying..." : "Deny"}
            </Button>
          </>
        )}
        {mode === "sent" && request.status === "pending" && (
          <Button onClick={() => cancelReq.mutate()} variant="destructive" disabled={cancelReq.isPending}>
            {cancelReq.isPending ? "Cancelling..." : "Cancel"}
          </Button>
        )}
      </div>
    </div>
  );
}

function shortId(id: string) {
  if (!id) return "user";
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}…${id.slice(-2)}`;
}
