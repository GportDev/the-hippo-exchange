import { useState } from "react";
import type { BorrowRequest } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MessageSquare, Package } from "lucide-react";
import { RequestDetailsModal } from "./RequestDetailsModal";

interface Props {
  request: BorrowRequest;
  mode: "sent" | "received";
}

export function RequestCard({ request, mode }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusProps = () => {
    switch (request.status) {
      case "pending":
        return {
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          bar: "bg-yellow-400",
          label: "Pending",
        };
      case "approved":
        return {
          badge: "bg-green-100 text-green-800 border-green-200",
          bar: "bg-green-500",
          label: "Approved",
        };
      case "denied":
        return {
          badge: "bg-red-100 text-red-800 border-red-200",
          bar: "bg-red-500",
          label: "Denied",
        };
      case "cancelled":
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          bar: "bg-gray-400",
          label: "Cancelled",
        };
    }
  };

  const statusProps = getStatusProps();
  const counterpartLabel = mode === "sent" ? `To: ${shortId(request.ownerId)}` : `From: ${shortId(request.requesterId)}`;
  const image = request.asset?.images?.[0];

  return (
    <>
      <div
        className="relative group overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer h-full flex flex-col"
        onClick={() => setIsModalOpen(true)}
      >
        <div className={`absolute left-0 top-0 h-full w-1.5 ${statusProps.bar}`}></div>
        <div className="ml-1.5 flex flex-col h-full flex-grow">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border shadow-sm group-hover:shadow-md transition-shadow">
              {image ? (
                <img src={image} alt={request.asset?.itemName ?? "Asset"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <Package className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="text-lg font-semibold text-primary-gray truncate" title={request.asset?.itemName ?? request.assetId}>
                  {request.asset?.itemName ?? request.assetId}
                </h3>
                <Badge className={`${statusProps.badge} text-xs`} variant="outline">
                  {statusProps.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{request.asset?.category ?? "Item"}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{counterpartLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(request.proposedStartDate).toLocaleDateString()} - {new Date(request.proposedEndDate).toLocaleDateString()}
                  </span>
                </div>
                {request.message && (
                  <div className="flex items-start gap-2 pt-1">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2 text-gray-700 italic">“{request.message}”</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </div>
      <RequestDetailsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} request={request} mode={mode} />
    </>
  );
}

function shortId(id: string) {
  if (!id) return "user";
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}…${id.slice(-2)}`;
}
