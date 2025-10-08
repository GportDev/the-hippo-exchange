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
    </header>
  )
}
