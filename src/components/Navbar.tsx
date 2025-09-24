import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import * as Lucide from "lucide-react";

function Navbar() {
  const[sidebar, setSidebar] = useState(false)

  const showSidebar = () => setSidebar(!sidebar)
  return (
    <>
        <div className="navbar">
            <Link to="/" className='menu-bars'>
                <Lucide.Menu size="2em" onClick={showSidebar}/> 
                {/* I have no idea how to do links */}
            </Link>
        </div>
        <nav  className={sidebar ? 'nav-menu-active' : "nav-menu" }>
          <ul className='nav-menu-items'>
            <li className='navbar-toggle'>
              <Link to="/" className='menu-bars'>
                <Lucide.X size="2em"/> 
              </Link>
            </li>
          </ul>
        </nav>
    </>
  )
}

export default Navbar
