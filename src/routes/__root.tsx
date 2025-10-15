import { useState, useEffect } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Toaster } from 'sonner'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Header from '@/components/Header'
import Navbar from '@/components/NavBar'
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
    <>
      <SignedIn>
        <div className="flex h-screen">
          <Toaster />
          <aside
            className={`group h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${
              sidebarExpanded ? 'transform translate-x-0' : 'transform -translate-x-full'
            }`}
            style={{
              width: '250px',
              height: '100vh',
              position: 'fixed',
              top: '0',
              left: '0',
              zIndex: '10',
            }}
          >
            <Navbar isExpanded={sidebarExpanded} onToggle={toggleSidebar} />
          </aside>
          <main className='flex flex-col h-screen overflow-hidden'>
            {!shouldHideHeader && <Header />}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col min-h-screen">
          {!shouldHideHeader && <Header />}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </SignedOut>
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})
