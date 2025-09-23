import {} from 'react'
import { Link } from '@tanstack/react-router'
import * as Lucide from "lucide-react";

function Navbar() {
  return (
    <>
        <div className="navbar">
            <Link to="/" className='menu-bars'>
                <Lucide.Menu size="2em"/>
            </Link>
        </div>
    </>
  )
}

export default Navbar
