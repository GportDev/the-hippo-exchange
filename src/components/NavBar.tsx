import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import * as Lucide from "lucide-react"
import { useState, useEffect } from 'react'
import ClerkHeader from '../integrations/clerk/header-user.tsx'

interface NavbarProps {
  isExpanded: boolean
  onToggle: () => void
}

function Navbar({ isExpanded, onToggle }: NavbarProps) {
  const [showText, setShowText] = useState(isExpanded);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isExpanded) {
      timer = setTimeout(() => setShowText(true), 100);
    } else {
      setShowText(false);
    }

    return () => clearTimeout(timer);
  }, [isExpanded]);
  
  return (
    <>
      <SignedIn>
        <nav className={`h-full bg-primary-gray text-primary-yellow transition-all duration-300 ease-in-out z-40 overflow-visible ${
          isExpanded ? 'w-64' : 'w-16'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header with toggle button */}
            <div className="flex items-center justify-between p-4 border-b border-primary-yellow/20">
              {isExpanded && <h2 className="text-lg font-semibold">Navigation</h2>}
              <button 
                type="button"
                onClick={onToggle}
                className="p-2 rounded-md hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200"
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isExpanded ? <Lucide.ChevronLeft size="1.2em" /> : <Lucide.ChevronRight size="1.2em" />}
              </button>
            </div>
            
            {/* Navigation links */}
            <ul className={`flex flex-col mt-4 ${isExpanded ? 'items-start' : 'items-center'}`}>
              <li className='mb-2 w-full'>
                <Link 
                  to="/home"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                  title={!isExpanded ? "My Assets" : undefined}
                >
                  <Lucide.House size="1.2em"/>
                  {showText && <span>Home</span>}
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/assets/my-assets"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                  title={!isExpanded ? "My Assets" : undefined}
                >
                  <Lucide.Package size="1.2em" />
                  {showText && <span>My Assets</span>}
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/maintenance"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                  title={!isExpanded ? "Maintenance" : undefined}
                >
                  <Lucide.Wrench size="1.2em" />
                  {showText && <span>Maintenance</span>}
                </Link>
              </li>
              
            </ul>

            <ClerkHeader 
              className='mt-auto px-4 py-3' 
            />
          </div>
        </nav>
      </SignedIn>
      
      <SignedOut>
        {/* Don't render sidebar for signed out users */}
      </SignedOut>
    </>
  )
}

export default Navbar 