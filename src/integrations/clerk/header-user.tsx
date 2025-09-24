import {
  SignedIn,
  SignInButton,
  SignedOut,
} from '@clerk/clerk-react'
import CustomUserButton from '@/components/Auth/UserButton'

export default function HeaderUser() {
  return (
    <>
      <SignedIn>
        <CustomUserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  )
}
