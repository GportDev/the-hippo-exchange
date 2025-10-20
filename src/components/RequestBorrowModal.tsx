import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApiClient } from "@/hooks/useApiClient";
import toast from "react-hot-toast";

interface RequestBorrowModalProps {
  assetId: string;
  assetName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RequestBorrowModal({ assetId, assetName, open, onOpenChange, onSuccess }: RequestBorrowModalProps) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [requestedFrom, setRequestedFrom] = useState("");
  const [requestedUntil, setRequestedUntil] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        assetId,
        message: message.trim() || undefined,
      };

      if (requestedFrom) {
        payload.requestedFrom = new Date(requestedFrom).toISOString();
      }

      if (requestedUntil) {
        payload.requestedUntil = new Date(requestedUntil).toISOString();
      }

      return apiClient("/borrow-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Borrow request sent");
      void queryClient.invalidateQueries({ queryKey: ["borrow-requests", "borrower"] });
      void queryClient.invalidateQueries({ queryKey: ["borrow-requests", "owner"] });
      onOpenChange(false);
      setMessage("");
      setRequestedFrom("");
      setRequestedUntil("");
      onSuccess?.();
    },
    onError: async (error: unknown) => {
      console.error(error);
      toast.error("Unable to send borrow request right now");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/15 bg-slate-950 text-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.9)]">
        <DialogHeader>
          <DialogTitle>Request to borrow</DialogTitle>
          <DialogDescription className="text-white/60">
            Let the owner know when you&apos;d like to use <span className="font-semibold text-white">{assetName}</span> and any details they should keep in mind.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="requestedFrom">Preferred start date</Label>
            <Input
              id="requestedFrom"
              type="date"
              value={requestedFrom}
              onChange={(event) => setRequestedFrom(event.target.value)}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestedUntil">Preferred return date</Label>
            <Input
              id="requestedUntil"
              type="date"
              value={requestedUntil}
              onChange={(event) => setRequestedUntil(event.target.value)}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message to owner</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share how you plan to use the item or special timing needs."
              className="min-h-[120px] border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-yellow/90 text-slate-900 hover:bg-primary-yellow"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
