import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-4xl rounded-b-[45%] bg-primary-yellow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 bottom-10 h-64 w-64 rounded-full bg-primary-yellow/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-120px] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary-yellow/10 blur-[120px]" />
        <div className="relative w-full max-w-3xl space-y-8">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-center shadow-[0_40px_120px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-yellow/20 text-3xl text-primary-yellow">
              🦛
            </div>
            <h1 className="mt-6 text-6xl font-bold tracking-tight sm:text-7xl">404</h1>
            <p className="mt-4 text-lg text-white/70">
              We can't find that page. Maybe the gear wandered off or the link is out on loan.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                to="/"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "rounded-full border border-primary-yellow/60 bg-primary-yellow text-slate-900 hover:bg-primary-yellow/80"
                )}
              >
                Bring me home
              </Link>
              <Link
                to="/sign-in"
                className={cn(
                  buttonVariants({ size: "lg", variant: "ghost" }),
                  "rounded-full border border-white/20 bg-white/10 text-white hover:border-primary-yellow/50 hover:bg-primary-yellow/10 hover:text-primary-yellow"
                )}
              >
                View my dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.9)] backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-yellow/20 text-primary-yellow">
                🔍
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Check the URL</p>
                <p className="text-xs text-white/60">
                  Paths are case-sensitive. Confirm you're visiting a live asset or maintenance link.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-yellow/20 text-primary-yellow">
                🧭
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Need a suggestion?</p>
                <p className="text-xs text-white/60">
                  Head back home to browse community assets or jump into maintenance planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
