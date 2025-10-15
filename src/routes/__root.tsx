import { useState, useEffect } from 'react'
import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import Header from '@/components/Header'
import ClerkProvider from '@/integrations/clerk/provider'
import Navbar from '@/components/NavBar'

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
    // This effect runs only on the client, after the initial render.
    const saved = localStorage.getItem('sidebar-expanded')
    if (saved !== null) {
      setSidebarExpanded(JSON.parse(saved))
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    // This also runs only on the client.
    localStorage.setItem('sidebar-expanded', JSON.stringify(sidebarExpanded))
  }, [sidebarExpanded])

  const toggleSidebar = () => {
    setSidebarExpanded((prev: boolean) => !prev)
  }

  // Check if current route should hide the header
  const shouldHideHeader = location.pathname === '/sign-in' || location.pathname === '/sign-up' || location.pathname === '/verify-email'

  return (
    <div className="min-h-screen bg-background">
      <SignedIn>
        <main className='flex flex-col h-screen overflow-hidden'>
          {!shouldHideHeader && <Header />}
          <div className="flex flex-1 overflow-hidden">
            <Navbar isExpanded={sidebarExpanded} onToggle={toggleSidebar} />
            <div className="flex-1 overflow-auto bg-gray-50">
              <Outlet />
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col min-h-screen">
          {!shouldHideHeader && <Header />}
          <div className="flex-1">
            <Outlet />
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
