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
  const counts = { sent: sampleSent.length, received: sampleReceived.length };

  return (
    <div className="bg-gray-50/50 p-6 min-h-screen">
      <section className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-gray">Requests</h1>
            <p className="text-gray-500">Borrowing requests you've sent and received.</p>
          </div>
        </div>

    <div className="flex gap-6 border-b border-gray-200 mb-4">
          {[
            { key: "sent", label: "Sent" },
            { key: "received", label: "Received" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key as "sent" | "received")}
              className={`relative px-1 font-semibold text-lg border-b-2 transition-colors cursor-pointer ${
                tab === key ? "border-primary-gray text-primary-gray" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              <span
                className={`ml-2 mb-3 inline-block min-w-[1.5em] px-2 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700`}
                aria-label={`Number of ${label.toLowerCase()} requests`}
              >
                {counts[key as "sent" | "received"]}
              </span>
            </button>
          ))}
          <div className="flex-grow" />
        </div>

        {list.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No {tab} requests yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {list.map((req) => (
              <RequestCard key={req.id} request={req} mode={tab} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
