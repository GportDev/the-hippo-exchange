import type { Loan } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Props {
  loan: Loan;
  mode: "borrowing" | "lending";
}

function daysLeft(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function LoanCard({ loan, mode }: Props) {
  const { user } = useUser();
  const qc = useQueryClient();
  const dLeft = daysLeft(loan.dueDate);

  const markReturned = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      return apiFetch(user.id, `/loans/${loan.id}/return`, { method: "PUT" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loans"] }),
  });

  const statusColor = {
    active: "bg-blue-100 text-blue-800",
    overdue: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  }[loan.status];

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-primary-gray">{loan.asset?.itemName ?? loan.assetId}</div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>{loan.status}</span>
      </div>
      <div className="text-sm text-gray-600">Due {new Date(loan.dueDate).toLocaleDateString()}</div>
      {loan.status === "active" && (
        <div className={`text-sm ${dLeft < 0 ? "text-red-600" : "text-gray-700"}`}>
          {dLeft < 0 ? `Overdue by ${Math.abs(dLeft)} day(s)` : `${dLeft} day(s) left`}
        </div>
      )}
      <div className="flex gap-2 ml-auto pt-2">
        {mode === "borrowing" && loan.status === "active" && (
          <Button onClick={() => markReturned.mutate()} disabled={markReturned.isPending} className="bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray">
            {markReturned.isPending ? "Submitting..." : "Mark as Returned"}
          </Button>
        )}
      </div>
    </div>
  );
}
