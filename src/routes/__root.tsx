import { Suspense, useState, useEffect } from 'react'
import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import Header from '@/components/Header'
import ClerkProvider from '@/integrations/clerk/provider'
import Navbar from '@/components/NavBar'
import { Toaster } from 'react-hot-toast'

import type { QueryClient } from '@tanstack/react-query'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import NotFoundComponent from '@/pages/NotFoundPage'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const location = useLocation()
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('sidebar-expanded')
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      setSidebarExpanded(isMobile ? false : parsed)
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    // This also runs only on the client.
    localStorage.setItem('sidebar-expanded', JSON.stringify(sidebarExpanded))
  }, [sidebarExpanded])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    if (mediaQuery.matches) {
      setSidebarExpanded(false)
    }
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setSidebarExpanded(false)
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarExpanded((prev: boolean) => !prev)
  }

  // Check if current route should hide the header
  const shouldHideHeader = location.pathname === '/sign-in' || location.pathname === '/sign-up' || location.pathname === '/verify-email'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <Toaster position="bottom-right" reverseOrder={false} />
      <SignedIn>
        <main className="relative flex h-screen flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl rounded-b-[45%] bg-primary-yellow/15 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-10 top-10 h-64 rounded-full bg-primary-yellow/10 blur-[120px] opacity-70" />
          {!shouldHideHeader && (
            <Header onToggleSidebar={toggleSidebar} isSidebarExpanded={sidebarExpanded} />
          )}
          {sidebarExpanded && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden"
              role="presentation"
              onClick={() => setSidebarExpanded(false)}
            />
          )}
          <div className="flex flex-1 overflow-hidden">
            <Navbar isExpanded={sidebarExpanded} onToggle={toggleSidebar} />
            <div className="relative flex-1 overflow-x-hidden overflow-y-scroll px-4 pb-10 pt-6 sm:px-6 lg:px-8">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_55%)]" />
              <Suspense fallback={<div className="p-6 text-sm text-white/60">Loading…</div>}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-4xl rounded-b-[45%] bg-primary-yellow/20 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-primary-yellow/10 blur-[120px]" />
          {!shouldHideHeader && (
            <Header onToggleSidebar={toggleSidebar} isSidebarExpanded={sidebarExpanded} />
          )}
          {sidebarExpanded && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden"
              role="presentation"
              onClick={() => setSidebarExpanded(false)}
            />
          )}
          <div className="relative flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),transparent_55%)]" />
            <Suspense fallback={<div className="p-6 text-sm text-white/60">Loading…</div>}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ClerkProvider>
        <RootComponent />
      </ClerkProvider>
    </>
  ),
  notFoundComponent: NotFoundComponent,
})
