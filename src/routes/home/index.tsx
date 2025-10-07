import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    // Check if user is authenticated via Clerk
    const isAuthenticated = typeof window !== 'undefined' && window.Clerk?.user !== null
    if (!isAuthenticated) {
      throw redirect({ to: '/', replace: true })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/"!</div>
}
