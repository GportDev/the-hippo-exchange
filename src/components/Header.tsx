import { Link } from '@tanstack/react-router'
import logo from '/Hypo-logo.png'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

export default function Header() {
  return (
    <header className="p-2 flex  items-center gap-2 bg-white text-black justify-between">
      <Link
        to='/'
        className='flex items-center gap-2'
      >
        <img
          src={logo}
          className="h-12"
          alt="logo"
        />
        <h1 className='text-xl font-bold'>The Hypo Exchange</h1>
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
        <ClerkHeader />
      </div>
    </header>
  )
}
