import { SignedOut, SignInButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="px-4 py-2 flex items-center gap-2 bg-primary-gray text-primary-yellow justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <Link
          to='/'
          className='flex items-center gap-2'
        >
          <h1 className='text-3xl font-bold'>Hippo Exchange</h1>
        </Link>
      </div>
      <SignedOut>
        <SignInButton>
          <button
            type="button"
            className="bg-primary-gray text-primary-yellow px-4 py-2 rounded-md font-semibold text-lg mr-4 hover:bg-primary-yellow hover:text-primary-gray transition-colors"
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </header>
  )
}
