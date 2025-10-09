import {
  SignedIn,
  SignInButton,
  SignedOut,
  useUser,
  UserButton,
} from '@clerk/clerk-react'
import { twMerge } from 'tailwind-merge'
import { useRef } from 'react'

export default function HeaderUser({ className }: { className?: string }) {
  const { user } = useUser()
  const userButtonRef = useRef<HTMLDivElement>(null)
  const signInButtonRef = useRef<HTMLDivElement>(null)

  const handleUserButtonClick = () => {
    const button = userButtonRef.current?.querySelector('button')
    if (button) {
      button.click()
    }
  }

  const handleSignInClick = () => {
    const button = signInButtonRef.current?.querySelector('button')
    if (button) {
      button.click()
    }
  }

  return (
    <div className={twMerge('flex items-center gap-4', className)}>
      <SignedIn>
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleUserButtonClick}
        >
          <div ref={userButtonRef}>
            <UserButton />
          </div>
          <div className='flex flex-col mb-1'>
            <p className='text-primary-yellow font-medium'>{user?.firstName} {user?.lastName}</p>
            <p className='text-primary-yellow text-sm'>{user?.username}</p>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <button className="bg-primary-gray text-primary-yellow px-4 py-2 rounded-md font-semibold text-lg mr-4 hover:bg-primary-yellow hover:text-primary-gray transition-colors">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}
