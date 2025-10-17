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
      className={twMerge('flex items-center w-full py-2 cursor-pointer', className)}
      aria-label="Account menu"
    >
      {/* Fixed icon column to avoid drift */}
      <div className="w-16 flex-shrink-0 flex items-center justify-center">
        <div ref={userButtonRef} className="pointer-events-none">
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
          <p className='text-primary-yellow text-sm leading-snug'>
            {user?.username}
          </p>
        </div>
      </div>
    </button>
  )
}
