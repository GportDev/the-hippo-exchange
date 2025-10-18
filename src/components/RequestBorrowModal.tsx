import type { Asset } from "@/lib/Types";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestBorrowModal({ asset, open, onOpenChange }: Props) {
  const { user } = useUser();
  const qc = useQueryClient();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");

  const maxDays = asset.maxLoanDays ?? 7;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        proposedStartDate: start,
        proposedEndDate: end,
        message,
      };
      // Use new endpoint when available; for now, POST to placeholder path to avoid 404 if backend isn't ready.
      return apiFetch(user.id, `/marketplace/${asset.id}/request`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests", user?.id] });
      onOpenChange(false);
      setStart("");
      setEnd("");
      setMessage("");
    },
  });

  const canSubmit = Boolean(start && end && user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request to borrow {asset.itemName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">Max loan days: {maxDays}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message to owner</Label>
            <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            {mutation.isPending ? "Sending..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
