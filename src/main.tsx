import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { getClerkPublishableKey } from './integrations/clerk/get-publishable-key'

// Create a new router instance
const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Import your Publishable Key
getClerkPublishableKey()

// Render the app
const rootElement = document.getElementById('app')
if (rootElement) {
  const app = (
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <Toaster />
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>
  )
  if (rootElement.innerHTML) {
    ReactDOM.hydrateRoot(rootElement, app)
  } else {
    ReactDOM.createRoot(rootElement).render(app)
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
