import { Link } from '@tanstack/react-router'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

export default function Header() {
  return (
    <header className="px-4 py-2 flex items-center gap-2 bg-primary-gray text-primary-yellow justify-between">
      <Link
        to='/'
        className='flex items-center gap-2'
      >
        <h1 className='text-3xl font-bold'>HE</h1>
      </Link>

      <div className='flex items-center gap-4'>
        <ClerkHeader />
      </div>
    </header>
  )
}
