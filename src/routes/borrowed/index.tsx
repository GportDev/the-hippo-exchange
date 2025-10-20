import { useMemo, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useApiClient } from "@/hooks/useApiClient";
import type { BorrowRequestSummary, BorrowRequestStatus } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Handshake, MapPin, Package } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

export const Route = createFileRoute("/borrowed/")({
  component: BorrowedRoute,
});

type DecisionMode = "approve" | "deny";

interface DecisionState {
  summary: BorrowRequestSummary;
  mode: DecisionMode;
}

function BorrowedRoute() {
  const { user, isSignedIn, isLoaded } = useUser();
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const { data: borrowerRequests = [], isLoading: borrowerLoading } = useQuery({
    queryKey: ["borrow-requests", "borrower"],
    queryFn: async () => apiClient<BorrowRequestSummary[]>("/borrow-requests/borrower"),
    enabled: isLoaded && !!user,
  });

  const { data: ownerRequests = [], isLoading: ownerLoading } = useQuery({
    queryKey: ["borrow-requests", "owner"],
    queryFn: async () => apiClient<BorrowRequestSummary[]>("/borrow-requests/owner"),
    enabled: isLoaded && !!user,
  });

  const [decisionState, setDecisionState] = useState<DecisionState | null>(null);
  const [decisionDueAt, setDecisionDueAt] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [completeState, setCompleteState] = useState<BorrowRequestSummary | null>(null);
  const [completeNote, setCompleteNote] = useState("");

  const invalidateBorrowQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["borrow-requests", "borrower"] });
    void queryClient.invalidateQueries({ queryKey: ["borrow-requests", "owner"] });
  };

  const decisionMutation = useMutation({
    mutationFn: async ({ id, approve, note, dueAt }: { id: string; approve: boolean; note?: string; dueAt?: string }) =>
      apiClient(`/borrow-requests/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          approve,
          note: note?.trim() || undefined,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        }),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.approve ? "Request approved" : "Request declined");
      invalidateBorrowQueries();
      setDecisionState(null);
      setDecisionDueAt("");
      setDecisionNote("");
    },
    onError: () => {
      toast.error("Unable to update request right now");
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) =>
      apiClient(`/borrow-requests/${id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ note: note?.trim() || undefined }),
      }),
    onSuccess: () => {
      toast.success("Marked as returned");
      invalidateBorrowQueries();
      setCompleteState(null);
      setCompleteNote("");
    },
    onError: () => {
      toast.error("Unable to complete request right now");
    },
  });

  const isLoading = !isLoaded || borrowerLoading || ownerLoading;

  if (!isLoaded) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-950 text-white/70">
        Loading your borrowing activity...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const borrowerActive = useMemo(
    () => borrowerRequests.filter((summary) => summary.request.status === "Approved"),
    [borrowerRequests],
  );
  const borrowerPending = useMemo(
    () => borrowerRequests.filter((summary) => summary.request.status === "Pending"),
    [borrowerRequests],
  );
  const borrowerHistory = useMemo(
    () =>
      borrowerRequests.filter((summary) =>
        ["Denied", "Returned", "Cancelled"].includes(summary.request.status),
      ),
    [borrowerRequests],
  );

  const ownerPending = useMemo(
    () => ownerRequests.filter((summary) => summary.request.status === "Pending"),
    [ownerRequests],
  );
  const ownerActive = useMemo(
    () => ownerRequests.filter((summary) => summary.request.status === "Approved"),
    [ownerRequests],
  );
  const ownerHistory = useMemo(
    () =>
      ownerRequests.filter((summary) =>
        ["Denied", "Returned", "Cancelled"].includes(summary.request.status),
      ),
    [ownerRequests],
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl rounded-b-[45%] bg-primary-yellow/20 blur-[140px]" />
        <PageContainer as="div" className="relative space-y-12 pt-10">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -left-20 top-12 h-64 w-64 rounded-full bg-primary-yellow/25 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
              </div>
              <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                    Borrow & lend
                  </span>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                      Coordinate every exchange
                    </h1>
                    <p className="max-w-xl text-base text-white/70 sm:text-lg">
                      Track the gear you&apos;ve requested, approve community loans, and keep a tidy record of what&apos;s out and what&apos;s back in your hands.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Requests pending",
                        value: ownerPending.length,
                        description: "Approvals waiting on you",
                      },
                      {
                        label: "Currently borrowing",
                        value: borrowerActive.length,
                        description: "Loans you&apos;re responsible for",
                      },
                      {
                        label: "Active lends",
                        value: ownerActive.length,
                        description: "Items teammates are using",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10"
                      >
                        <p className="text-xs uppercase tracking-[0.35em] text-white/50">{stat.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                        <p className="mt-1 text-xs text-white/60">{stat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
                    <Handshake className="h-14 w-14 text-primary-yellow" />
                    <p className="text-sm text-white/70">
                      Keep communication open. Approve requests quickly, share care instructions, and mark items returned when the job is done.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {isLoading ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                Loading your activity…
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
                  <header className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">My borrow requests</h2>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                      {borrowerPending.length + borrowerActive.length} active
                    </span>
                  </header>
                  <div className="space-y-4">
                    {borrowerPending.length > 0 && (
                      <BorrowerGroup title="Waiting for approval" description="These requests are pending a response." summaries={borrowerPending} />
                    )}
                    {borrowerActive.length > 0 && (
                      <BorrowerGroup title="Currently borrowed" description="Remember to follow the agreed return time." summaries={borrowerActive} highlight />
                    )}
                    {borrowerPending.length === 0 && borrowerActive.length === 0 && (
                      <EmptyState
                        icon={<Package className="h-10 w-10 text-white/40" />}
                        title="No open requests"
                        description="Browse the home feed to find something to borrow."
                      />
                    )}
                  </div>
                  {borrowerHistory.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h3 className="text-sm font-semibold text-white/70">History</h3>
                      <HistoryList summaries={borrowerHistory} perspective="borrower" />
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
                  <header className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">Requests for my gear</h2>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                      {ownerPending.length} waiting
                    </span>
                  </header>
                  <div className="space-y-4">
                    {ownerPending.length > 0 ? (
                      ownerPending.map((summary) => (
                        <OwnerRequestCard
                          key={summary.request.id}
                          summary={summary}
                          onApprove={() => {
                            setDecisionState({ summary, mode: "approve" });
                            setDecisionDueAt("");
                            setDecisionNote("");
                          }}
                          onDecline={() => {
                            setDecisionState({ summary, mode: "deny" });
                            setDecisionNote("");
                          }}
                        />
                      ))
                    ) : (
                      <EmptyState
                        icon={<CheckCircle2 className="h-10 w-10 text-white/40" />}
                        title="You&apos;re all caught up"
                        description="New borrow requests will show up here for approval."
                      />
                    )}
                  </div>
                  {ownerActive.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h3 className="text-sm font-semibold text-white/70">Currently lent out</h3>
                      <div className="space-y-4">
                        {ownerActive.map((summary) => (
                          <ActiveLoanCard
                            key={summary.request.id}
                            summary={summary}
                            onComplete={() => {
                              setCompleteState(summary);
                              setCompleteNote("");
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {ownerHistory.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h3 className="text-sm font-semibold text-white/70">History</h3>
                      <HistoryList summaries={ownerHistory} perspective="owner" />
                    </div>
                  )}
                </section>
              </div>
            )}
        </PageContainer>
      </main>

      <DecisionDialog
        state={decisionState}
        isSubmitting={decisionMutation.isPending}
        dueAt={decisionDueAt}
        note={decisionNote}
        onDueAtChange={setDecisionDueAt}
        onNoteChange={setDecisionNote}
        onClose={() => setDecisionState(null)}
        onConfirm={(payload) => decisionMutation.mutate(payload)}
      />

      <CompleteDialog
        summary={completeState}
        note={completeNote}
        onNoteChange={setCompleteNote}
        isSubmitting={completeMutation.isPending}
        onClose={() => setCompleteState(null)}
        onConfirm={(payload) => completeMutation.mutate(payload)}
      />
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusBadgeColor(status: BorrowRequestStatus) {
  switch (status) {
    case "Approved":
      return "bg-emerald-500/20 text-emerald-200 border-emerald-300/40";
    case "Pending":
      return "bg-amber-500/15 text-amber-200 border-amber-300/40";
    case "Denied":
      return "bg-red-500/15 text-red-200 border-red-300/40";
    case "Returned":
      return "bg-slate-500/15 text-slate-200 border-slate-300/40";
    default:
      return "bg-white/10 text-white/70 border-white/20";
  }
}

interface BorrowerGroupProps {
  title: string;
  description: string;
  summaries: BorrowRequestSummary[];
  highlight?: boolean;
}

function BorrowerGroup({ title, description, summaries, highlight = false }: BorrowerGroupProps) {
  return (
    <div className={`rounded-2xl border ${highlight ? "border-primary-yellow/40 bg-primary-yellow/10" : "border-white/10 bg-white/5"} p-4 backdrop-blur`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/60">{description}</p>
        </div>
        <Badge className={`border ${statusBadgeColor(summaries[0].request.status)}`}>{summaries[0].request.status}</Badge>
      </div>
      <div className="space-y-3">
        {summaries.map((summary) => (
          <div key={summary.request.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{summary.asset.itemName}</p>
                <p className="text-xs text-white/60">
                  From {summary.counterparty.firstName ?? summary.counterparty.username ?? "a community member"}
                </p>
              </div>
              <span className="text-xs text-white/50">Requested {formatDate(summary.request.requestedAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
              {summary.request.requestedFrom && (
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon />
                  {formatDate(summary.request.requestedFrom)}{summary.request.requestedUntil ? ` → ${formatDate(summary.request.requestedUntil)}` : ""}
                </span>
              )}
              {summary.asset.currentLocation && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {summary.asset.currentLocation}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OwnerRequestCardProps {
  summary: BorrowRequestSummary;
  onApprove: () => void;
  onDecline: () => void;
}

function OwnerRequestCard({ summary, onApprove, onDecline }: OwnerRequestCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`border ${statusBadgeColor(summary.request.status)}`}>{summary.request.status}</Badge>
            <span className="text-xs text-white/50">Requested {formatDate(summary.request.requestedAt)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{summary.asset.itemName}</p>
            <p className="text-xs text-white/60">{summary.counterparty.firstName ?? summary.counterparty.username ?? "Community member"}</p>
          </div>
          {summary.request.message && (
            <p className="text-xs text-white/60">“{summary.request.message}”</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onDecline}
            className="border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          >
            Decline
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            className="bg-primary-yellow/90 text-slate-900 hover:bg-primary-yellow"
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ActiveLoanCardProps {
  summary: BorrowRequestSummary;
  onComplete: () => void;
}

function ActiveLoanCard({ summary, onComplete }: ActiveLoanCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{summary.asset.itemName}</p>
          <p className="text-xs text-white/60">
            With {summary.counterparty.firstName ?? summary.counterparty.username ?? "community member"}
          </p>
          {summary.request.dueAt && (
            <p className="text-xs text-white/50">Due by {formatDate(summary.request.dueAt)}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
          className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
        >
          Mark returned
        </Button>
      </div>
    </div>
  );
}

interface HistoryListProps {
  summaries: BorrowRequestSummary[];
  perspective: "borrower" | "owner";
}

function HistoryList({ summaries, perspective }: HistoryListProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      {summaries.map((summary) => (
        <div key={summary.request.id} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{summary.asset.itemName}</p>
            <p>{perspective === "borrower" ? "From" : "To"} {summary.counterparty.firstName ?? summary.counterparty.username ?? "community member"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`border ${statusBadgeColor(summary.request.status)}`}>{summary.request.status}</Badge>
            {summary.request.returnedAt && <span>Returned {formatDate(summary.request.returnedAt)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center text-white/60">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/60">{description}</p>
    </div>
  );
}

interface DecisionDialogProps {
  state: DecisionState | null;
  isSubmitting: boolean;
  dueAt: string;
  note: string;
  onDueAtChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: (payload: { id: string; approve: boolean; note?: string; dueAt?: string }) => void;
}

function DecisionDialog({ state, isSubmitting, dueAt, note, onDueAtChange, onNoteChange, onClose, onConfirm }: DecisionDialogProps) {
  const isApprove = state?.mode === "approve";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!state) return;
    onConfirm({
      id: state.summary.request.id,
      approve: isApprove,
      note,
      dueAt: isApprove ? dueAt : undefined,
    });
  };

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border border-white/10 bg-slate-950/85 text-white">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve request" : "Decline request"}</DialogTitle>
          <DialogDescription className="text-white/60">
            {isApprove
              ? "Confirm lending this asset and optionally set a return date."
              : "Share a quick note so the borrower knows why it was declined."}
          </DialogDescription>
        </DialogHeader>
        {state && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isApprove && (
              <div className="space-y-2">
                <label htmlFor="dueAt" className="text-sm text-white/70">
                  Return by (optional)
                </label>
                <Input
                  id="dueAt"
                  type="date"
                  value={dueAt}
                  onChange={(event) => onDueAtChange(event.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="decisionNote" className="text-sm text-white/70">
                Message to borrower (optional)
              </label>
              <Textarea
                id="decisionNote"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                className="min-h-[120px] border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary-yellow/90 text-slate-900 hover:bg-primary-yellow">
                {isSubmitting ? "Saving..." : isApprove ? "Approve" : "Decline"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CompleteDialogProps {
  summary: BorrowRequestSummary | null;
  note: string;
  onNoteChange: (value: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { id: string; note?: string }) => void;
}

function CompleteDialog({ summary, note, onNoteChange, isSubmitting, onClose, onConfirm }: CompleteDialogProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!summary) return;
    onConfirm({ id: summary.request.id, note });
  };

  return (
    <Dialog open={summary !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border border-white/10 bg-slate-950/85 text-white">
        <DialogHeader>
          <DialogTitle>Mark as returned</DialogTitle>
          <DialogDescription className="text-white/60">
            Confirm that the borrower has returned the item in good condition.
          </DialogDescription>
        </DialogHeader>
        {summary && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">{summary.asset.itemName}</p>
              <p className="text-xs text-white/60">Borrowed by {summary.counterparty.firstName ?? summary.counterparty.username ?? "a community member"}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="complete-note" className="text-sm text-white/70">
                Notes (optional)
              </label>
              <Textarea
                id="complete-note"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                className="min-h-[120px] border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary-yellow/90 text-slate-900 hover:bg-primary-yellow">
                {isSubmitting ? "Saving..." : "Confirm return"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CalendarIcon() {
  return <Clock className="h-3.5 w-3.5" />;
}
