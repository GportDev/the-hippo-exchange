import {} from 'react'
import { Link } from '@tanstack/react-router'
import * as FaIcons from "react-icons/fa";

function Navbar() {
  return (
    <>
        <div className="navbar">
            <Link to="/" className='menu-bars'>
                <FaIcons.FaBars size="1.5em"/>
            </Link>
        </div>
    </>
  )
}

export default Navbar
