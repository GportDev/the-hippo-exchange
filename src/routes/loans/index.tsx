import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Loan } from "@/lib/Types";
import { LoanCard } from "../../components/LoanCard";

export const Route = createFileRoute("/loans/")({
  component: LoansPage,
});

function LoansPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [tab, setTab] = useState<"borrowing" | "lending">("borrowing");

  if (isLoaded && !isSignedIn) return <Navigate to="/" replace />;

  const { data: outgoing = [], isLoading: outLoading } = useQuery<Loan[]>({
    queryKey: ["loans", "outgoing", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/loans/outgoing");
    },
    enabled: !!user,
  });
  const { data: incoming = [], isLoading: inLoading } = useQuery<Loan[]>({
    queryKey: ["loans", "incoming", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/loans/incoming");
    },
    enabled: !!user,
  });

  const isLoading = outLoading || inLoading;
  const list = tab === "borrowing" ? incoming : outgoing;

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-primary-gray">My Loans</h1>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setTab("borrowing")}
              className={`px-4 py-2 rounded-md border cursor-pointer ${
                tab === "borrowing" ? "bg-primary-gray text-primary-yellow" : "bg-white text-primary-gray"
              }`}
            >
              Items I'm Borrowing
            </button>
            <button
              type="button"
              onClick={() => setTab("lending")}
              className={`px-4 py-2 rounded-md border cursor-pointer ${
                tab === "lending" ? "bg-primary-gray text-primary-yellow" : "bg-white text-primary-gray"
              }`}
            >
              Items I've Lent
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-primary-gray">Loading loans...</div>
        ) : list.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No loans to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((loan) => (
              <LoanCard key={loan.id} loan={loan} mode={tab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
