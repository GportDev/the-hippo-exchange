import { SignedOut, SignInButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar?: () => void
  isSidebarExpanded?: boolean
}

export default function Header({ onToggleSidebar, isSidebarExpanded }: HeaderProps) {
  return (
    <header className="relative z-20 flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 text-white shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2 text-white transition hover:border-primary-yellow/50 hover:bg-primary-yellow/15 hover:text-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow/60 md:hidden"
            aria-label={isSidebarExpanded ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link
          to="/"
          className="flex items-center gap-2 text-white transition hover:text-primary-yellow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-lg font-semibold text-primary-yellow">
            HX
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight sm:text-xl">Don&apos;t buy, Borrow</span>
            <span className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50 sm:text-xs">Hippo Exchange</span>
          </div>
        </Link>
      </div>
      <SignedOut>
        <SignInButton>
          <button
            type="button"
            className="mr-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary-yellow/60 hover:bg-primary-yellow/10 hover:text-primary-yellow"
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </header>
  )
}
