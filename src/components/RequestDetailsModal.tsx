import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BorrowRequest } from "@/lib/Types";
import { Badge } from "./ui/badge";
import { Calendar, User, MessageSquare, Package } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";

interface RequestDetailsModalProps {
  request: BorrowRequest;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "sent" | "received";
}

function shortId(id: string) {
  if (!id) return "user";
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}…${id.slice(-2)}`;
}

export function RequestDetailsModal({
  request,
  isOpen,
  onOpenChange,
  mode,
}: RequestDetailsModalProps) {
  const { user } = useUser();
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}/approve`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      onOpenChange(false);
    },
  });

  const deny = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}/deny`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      onOpenChange(false);
    },
  });

  const cancelReq = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/requests/${request.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      onOpenChange(false);
    },
  });

  const getStatusProps = () => {
    switch (request.status) {
      case "pending":
        return {
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Pending",
        };
      case "approved":
        return {
          badge: "bg-green-100 text-green-800 border-green-200",
          label: "Approved",
        };
      case "denied":
        return {
          badge: "bg-red-100 text-red-800 border-red-200",
          label: "Denied",
        };
      case "cancelled":
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Cancelled",
        };
    }
  };

  const statusProps = getStatusProps();
  const counterpartLabel =
    mode === "sent"
      ? `To: ${shortId(request.ownerId)}`
      : `From: ${shortId(request.requesterId)}`;
  const image = request.asset?.images?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Request Details
            <Badge className={`${statusProps.badge}`} variant="outline">
              {statusProps.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review the details of this borrow request.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border">
              {image ? (
                <img
                  src={image}
                  alt={request.asset?.itemName ?? "Asset"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {request.asset?.category ?? "Item"}
              </p>
              <h3
                className="text-xl font-semibold text-primary-yellow"
                title={request.asset?.itemName ?? request.assetId}
              >
                {request.asset?.itemName ?? request.assetId}
              </h3>
              <p className="text-sm text-gray-400">
                {request.asset?.brandName}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-base text-gray-300">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span>{counterpartLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>
                {new Date(request.proposedStartDate).toLocaleDateString()} -{" "}
                {new Date(request.proposedEndDate).toLocaleDateString()}
              </span>
            </div>
            {request.message && (
              <div className="flex items-start gap-3 pt-2">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-200 italic">“{request.message}”</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {mode === "received" && request.status === "pending" && (
            <>
              <Button
                onClick={() => deny.mutate()}
                variant="outline"
                disabled={deny.isPending || approve.isPending}
              >
                {deny.isPending ? "Denying..." : "Deny"}
              </Button>
              <Button
                onClick={() => approve.mutate()}
                disabled={approve.isPending || deny.isPending}
                className="bg-primary-yellow hover:bg-primary-yellow/90 text-primary-gray"
              >
                {approve.isPending ? "Approving..." : "Approve"}
              </Button>
            </>
          )}
          {mode === "sent" && request.status === "pending" && (
            <>
              <Button
                onClick={() => {
                  // TODO: Implement Edit Request functionality
                  onOpenChange(false);
                }}
                variant="outline"
              >
                Edit Request
              </Button>
              <Button
                onClick={() => cancelReq.mutate()}
                variant="outline"
                disabled={cancelReq.isPending}
              >
                {cancelReq.isPending ? "Cancelling..." : "Cancel Request"}
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
