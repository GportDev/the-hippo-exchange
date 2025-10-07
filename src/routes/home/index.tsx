import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    // Wait for Clerk to load if it hasn't already
    if (typeof window !== 'undefined' && window.Clerk) {
      // Check if user is authenticated via Clerk session
      if (!window.Clerk.session) {
        throw redirect({ to: '/', replace: true })
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/"!</div>
}
