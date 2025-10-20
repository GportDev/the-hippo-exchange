import { ClerkProvider } from '@clerk/clerk-react'
import { getClerkPublishableKey } from './get-publishable-key'

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = getClerkPublishableKey()

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}
