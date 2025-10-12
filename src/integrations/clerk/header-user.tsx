import {
  useUser,
  UserButton,
} from '@clerk/clerk-react'
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
    <div className={twMerge('flex gap-4', className)}>
        <div 
          className="flex gap-4"
        >
          <div ref={userButtonRef} className={isNavExpanded ? "mt-[0.375rem]" : "mb-10 ml-2"}>
            <UserButton />
          </div>
          {isNavExpanded && (
            <div className='flex flex-col cursor-pointer'
              onClick={handleUserButtonClick}
            >
              <p className='text-primary-yellow font-medium'>{user?.firstName} {user?.lastName}</p>
              <p className='text-primary-yellow text-sm'>{user?.username}</p>
            </div>
          )}
        </div>
    </div>
  )
}
