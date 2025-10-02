import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import * as Lucide from "lucide-react"

interface NavbarProps {
  isExpanded: boolean
  onToggle: () => void
}

function Navbar({ isExpanded, onToggle }: NavbarProps) {
  return (
    <>
      <SignedIn>
        <nav className={`h-screen bg-primary-gray text-primary-yellow transition-all duration-300 ease-in-out z-40 ${
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
            <ul className="flex-1 mt-4">
              <li className="mb-2">
                <Link 
                  to="/assets/my-assets"
                  className={`flex items-center gap-3 px-4 py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                  title={!isExpanded ? "My Assets" : undefined}
                >
                  <Lucide.Package size="1.2em" />
                  {isExpanded && <span>My Assets</span>}
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/maintenance"
                  className={`flex items-center gap-3 px-4 py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                  title={!isExpanded ? "Maintenance" : undefined}
                >
                  <Lucide.Wrench size="1.2em" />
                  {isExpanded && <span>Maintenance</span>}
                </Link>
              </li>
            </ul>
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