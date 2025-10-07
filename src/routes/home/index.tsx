import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isSignedIn, isLoaded } = useUser()
  
  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />
  }
  
  return <div>Hello "/home/"!</div>
}
