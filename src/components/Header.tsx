import { Link } from '@tanstack/react-router'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

export default function Header() {
  return (
    <header className="px-4 py-2 flex  items-center gap-2 bg-primary-gray text-primary-yellow justify-between">
      <Link
        to='/'
        className='flex items-center gap-2'
      >
        <h1 className='text-3xl font-bold'>HE</h1>
      </Link>
      {/* <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demos/clerk">Clerk</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demos/tanstack-query">TanStack Query</Link>
        </div>
      </nav> */}

      <div>
        <div className="px-2 font-bold">
          <Link to="/MyAssetsPage">go to assets</Link>
        </div>
        <ClerkHeader />
      </div>
    </header>
  )
}