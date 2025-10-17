import { useUser, UserButton } from '@clerk/clerk-react'
import { twMerge } from 'tailwind-merge'
import { useRef } from 'react'

export default function HeaderUser({ className, isNavExpanded }: { className?: string, isNavExpanded?: boolean }) {
  const { user } = useUser()
  const userButtonRef = useRef<HTMLDivElement>(null)

  const handleUserButtonClick = () => {
    const button = userButtonRef.current?.querySelector('button')
    if (button) {
      button.click()
    }
  }

  return (
    <button
      type="button"
      onClick={handleUserButtonClick}
      className={twMerge(
        'flex items-center w-full py-4 cursor-pointer transition-colors duration-200 border-t border-primary-yellow/10',
        isNavExpanded 
          ? 'hover:bg-gray-700 rounded-lg mx-0' 
          : 'hover:bg-gray-700/50 rounded-lg',
        className
      )}
      aria-label="Account menu"
    >
      {/* Fixed icon column to avoid drift */}
      <div className="w-16 flex-shrink-0 flex items-center justify-center">
        <div ref={userButtonRef} className="pointer-events-none scale-140 flex items-center justify-center">
          <UserButton />
        </div>
      </div>

      {/* Smoothly revealed text, same pattern as nav labels */}
      <div
        className={`overflow-hidden whitespace-nowrap select-none text-left flex items-center ${
          isNavExpanded
            ? 'opacity-100 translate-x-0 max-w-[180px] ml-2'
            : 'opacity-0 -translate-x-2 max-w-0 ml-0'
        } transition-all duration-300 ease-in-out`}
        aria-hidden={!isNavExpanded}
      >
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
          <p className='text-primary-yellow font-medium leading-snug'>
            {user?.firstName} {user?.lastName}
          </p>
          <p className='text-gray-400 text-sm leading-snug'>
            {user?.username}
          </p>
        </div>
      </div>
    </button>
  )
}
