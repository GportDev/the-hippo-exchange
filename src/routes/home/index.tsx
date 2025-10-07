import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    // Check if user is authenticated via Clerk
    if (typeof window !== 'undefined') {
      // Check if there's a Clerk session token in storage
      // Clerk stores the session in __session or __clerk_db_jwt
      const hasSession = document.cookie.includes('__session') || 
                        document.cookie.includes('__clerk_db_jwt') ||
                        (window.Clerk && window.Clerk.session)
      
      if (!hasSession) {
        throw redirect({ to: '/', replace: true })
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/"!</div>
}
