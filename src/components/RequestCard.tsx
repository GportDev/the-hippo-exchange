import type { BorrowRequest } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

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

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  }[request.status];

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-primary-gray">{request.asset?.itemName ?? request.assetId}</div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>{request.status}</span>
      </div>
      <div className="text-sm text-gray-600">
        {new Date(request.proposedStartDate).toLocaleDateString()} - {new Date(request.proposedEndDate).toLocaleDateString()}
      </div>
      {request.message && <div className="text-sm text-gray-700">“{request.message}”</div>}

      <div className="flex gap-2 ml-auto pt-2">
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
