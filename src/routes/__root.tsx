import { useState, useEffect } from 'react'
import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import Header from '@/components/Header'
import ClerkProvider from '@/integrations/clerk/provider'
import Navbar from '@/components/NavBar'

import type { QueryClient } from '@tanstack/react-query'
import { SignedIn, SignedOut } from '@clerk/clerk-react'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const location = useLocation()
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('sidebar-expanded')
    return saved ? JSON.parse(saved) : false
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(sidebarExpanded))
  }, [sidebarExpanded])

  const toggleSidebar = () => {
    setSidebarExpanded((prev: boolean) => !prev)
  }

  // Check if current route should hide the header
  const shouldHideHeader = location.pathname === '/sign-in' || location.pathname === '/sign-up' || location.pathname === '/verify-email'

  return (
    <div className="min-h-screen bg-background">
      {!shouldHideHeader && <Header />}
      <SignedIn>
        <main className='flex h-screen'>
          <Navbar isExpanded={sidebarExpanded} onToggle={toggleSidebar} />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <Outlet />
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
})
