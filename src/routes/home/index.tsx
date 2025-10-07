import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    // Check if user is authenticated via Clerk
    if (typeof window !== 'undefined') {
      // Wait for Clerk to load and check session
      // If Clerk is loaded, we must check its session state
      // If session is null/undefined, redirect regardless of cookies
      if (window.Clerk) {
        if (!window.Clerk.session) {
          throw redirect({ to: '/', replace: true })
        }
      } else {
        // If Clerk hasn't loaded yet, check for session cookies as fallback
        const hasSessionCookie = document.cookie.includes('__session') || 
                                 document.cookie.includes('__clerk_db_jwt')
        if (!hasSessionCookie) {
          throw redirect({ to: '/', replace: true })
        }
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/"!</div>
}
