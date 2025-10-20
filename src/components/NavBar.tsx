import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import * as Lucide from "lucide-react"
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import { useIsClient } from '@/hooks/useIsClient.ts'

interface NavbarProps {
  isExpanded: boolean
  onToggle: () => void
}

function Navbar({ isExpanded, onToggle }: NavbarProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  const handleCloseOnMobile = () => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 767px)').matches && isExpanded) {
      onToggle();
    }
  };
  
  return (
    <>
      <SignedIn>
        <nav
          id="app-sidebar"
          aria-label="Primary"
          data-expanded={isExpanded}
          className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[90vw] -translate-x-full flex-col bg-slate-950/90 text-white shadow-2xl backdrop-blur transition-all duration-300 ease-in-out md:static md:w-auto md:max-w-none md:translate-x-0 md:shadow-none ${
            isExpanded ? 'translate-x-0 md:w-64' : 'md:w-20'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with toggle button */}
            <div className="border-t border-white/5">
              <div className="flex items-center justify-end-safe border-b border-white/10 p-4">
                <button
                  type="button"
                  onClick={onToggle}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors duration-200 hover:border-primary-yellow/50 hover:bg-primary-yellow/15 hover:text-primary-yellow"
                  aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  aria-controls="app-sidebar"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? <Lucide.ChevronLeft size="1.2em" /> : <Lucide.ChevronRight size="1.2em" />}
                </button>
              </div>
            </div>
            
            {/* Navigation links */}
            <ul className="mt-4 flex flex-1 flex-col items-start gap-1 overflow-y-auto px-1">
              <li className="mb-2 w-full">
                <Link 
                  to="/home"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white transition-colors duration-200 hover:bg-white/10 hover:text-primary-yellow"
                  title={!isExpanded ? "Home" : undefined}
                  onClick={handleCloseOnMobile}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Lucide.House size="1.2em" />
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap select-none text-sm font-medium transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? 'opacity-100 translate-x-0 flex-1 text-left'
                        : 'pointer-events-none opacity-0 -translate-x-2 max-w-0'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    Home
                  </span>
                </Link>
              </li>
              <li className="mb-2 w-full">
                <Link 
                  to="/assets/my-assets"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white transition-colors duration-200 hover:bg-white/10 hover:text-primary-yellow"
                  title={!isExpanded ? "My Assets" : undefined}
                  onClick={handleCloseOnMobile}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Lucide.Package size="1.2em" />
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap select-none text-sm font-medium transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? 'opacity-100 translate-x-0 flex-1 text-left'
                        : 'pointer-events-none opacity-0 -translate-x-2 max-w-0'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    My Assets
                  </span>
                </Link>
              </li>
              <li className="mb-2 w-full">
                <Link 
                  to="/borrowed"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white transition-colors duration-200 hover:bg-white/10 hover:text-primary-yellow"
                  title={!isExpanded ? "Borrowed & Lent" : undefined}
                  onClick={handleCloseOnMobile}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Lucide.ArrowLeftRight size="1.2em" />
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap select-none text-sm font-medium transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? 'opacity-100 translate-x-0 flex-1 text-left'
                        : 'pointer-events-none opacity-0 -translate-x-2 max-w-0'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    Borrowed &amp; Lent
                  </span>
                </Link>
              </li>
              <li className="mb-2 w-full">
                <Link 
                  to="/maintenance"
                  search={{ filter: 'all' }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white transition-colors duration-200 hover:bg-white/10 hover:text-primary-yellow"
                  title={!isExpanded ? "Maintenance" : undefined}
                  onClick={handleCloseOnMobile}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Lucide.Wrench size="1.2em" />
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap select-none text-sm font-medium transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? 'opacity-100 translate-x-0 flex-1 text-left'
                        : 'pointer-events-none opacity-0 -translate-x-2 max-w-0'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    Maintenance
                  </span>
                </Link>
              </li>
              
            </ul>

            <ClerkHeader 
              className="mt-auto mb-0"
              isNavExpanded={isExpanded}
            />
          </div>
        </nav>
      </SignedIn>
      
      <SignedOut>
        {/* Don't render sidebar for signed out users */}
      </SignedOut>
    </>
  )
}

export default Navbar 
