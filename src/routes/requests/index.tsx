import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import type { BorrowRequest } from "@/lib/Types";
import { RequestCard } from "@/components/RequestCard";

export const Route = createFileRoute("/requests/")({
  component: RequestsPage,
});

function RequestsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [tab, setTab] = useState<"sent" | "received">("sent");

  if (isLoaded && !isSignedIn) return <Navigate to="/" replace />;

  // Static sample data for MVP UI demo
  const sampleSent: BorrowRequest[] = [
    {
      id: "req_s_1",
      assetId: "asset_1",
      requesterId: "me",
      ownerId: "user_abc",
      status: "pending",
      requestDate: new Date().toISOString(),
      proposedStartDate: new Date().toISOString(),
      proposedEndDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      message: "Can I borrow this for the weekend?",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      asset: { id: "asset_1", itemName: "DeWalt Drill", brandName: "DeWalt", category: "Power Tools", purchaseDate: new Date().toISOString(), purchaseCost: 199, currentLocation: "Detroit, MI", images: [], conditionDescription: "Like new", ownerUserId: "user_abc", status: "available", favorite: false },
    },
    {
      id: "req_s_2",
      assetId: "asset_2",
      requesterId: "me",
      ownerId: "user_xyz",
      status: "approved",
      requestDate: new Date().toISOString(),
      proposedStartDate: new Date().toISOString(),
      proposedEndDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      message: "Need for a quick job",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      asset: { id: "asset_2", itemName: "Lawn Mower", brandName: "Honda", category: "Garden Tools", purchaseDate: new Date().toISOString(), purchaseCost: 350, currentLocation: "Detroit, MI", images: [], conditionDescription: "Good", ownerUserId: "user_xyz", status: "available", favorite: false },
    },
  ];

  const sampleReceived: BorrowRequest[] = [
    {
      id: "req_r_1",
      assetId: "asset_3",
      requesterId: "user_987",
      ownerId: "me",
      status: "pending",
      requestDate: new Date().toISOString(),
      proposedStartDate: new Date(Date.now() + 86400000).toISOString(),
      proposedEndDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      message: "Long weekend project",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      asset: { id: "asset_3", itemName: "Pressure Washer", brandName: "Ryobi", category: "Power Tools", purchaseDate: new Date().toISOString(), purchaseCost: 250, currentLocation: "Detroit, MI", images: [], conditionDescription: "Fair", ownerUserId: "me", status: "available", favorite: false },
    },
    {
      id: "req_r_2",
      assetId: "asset_4",
      requesterId: "user_123",
      ownerId: "me",
      status: "denied",
      requestDate: new Date().toISOString(),
      proposedStartDate: new Date().toISOString(),
      proposedEndDate: new Date(Date.now() + 86400000).toISOString(),
      message: "Quick borrow?",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      asset: { id: "asset_4", itemName: "Circular Saw", brandName: "Bosch", category: "Power Tools", purchaseDate: new Date().toISOString(), purchaseCost: 180, currentLocation: "Detroit, MI", images: [], conditionDescription: "Used", ownerUserId: "me", status: "available", favorite: false },
    },
  ];

  const list = tab === "sent" ? sampleSent : sampleReceived;

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-primary-gray">Requests</h1>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setTab("sent")}
              className={`px-4 py-2 rounded-md border cursor-pointer ${
                tab === "sent" ? "bg-primary-gray text-primary-yellow" : "bg-white text-primary-gray"
              }`}
            >
              Sent Requests
            </button>
            <button
              type="button"
              onClick={() => setTab("received")}
              className={`px-4 py-2 rounded-md border cursor-pointer ${
                tab === "received" ? "bg-primary-gray text-primary-yellow" : "bg-white text-primary-gray"
              }`}
            >
              Received Requests
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No {tab} requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((req) => (
              <RequestCard key={req.id} request={req} mode={tab} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
