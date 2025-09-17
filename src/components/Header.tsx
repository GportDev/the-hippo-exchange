import { Link } from '@tanstack/react-router'

import React, { useState } from 'react'; /*will presumably become obselete when connected to API endpoints */

import { Coins } from 'lucide-react'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

import { useUser } from "@clerk/clerk-react"

export default function Header() {

  const {isSignedIn} = useUser();

  const [Credits, SetCredits] = useState(1000000)/*will presumably become obselete when connected to API endpoints */
  
  if(!isSignedIn){
       return (
    <header className="px-4 py-2 flex  items-center gap-2 bg-primary-gray text-primary-yellow justify-between">
      <Link
        to='/'
        className='flex items-center gap-2'
      >
        <h1 className='text-3xl font-bold'>HE</h1>
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
        <h1 className='text-xl flex space-x-4'>
          <ClerkHeader />
        </h1>
      </div>
    </header>
  )

  }
  if(isSignedIn){

      return (
    <header className="px-4 py-2 flex  items-center gap-2 bg-primary-gray text-primary-yellow justify-between">
      <Link
        to='/'
        className='flex items-center gap-2'
      >
        <h1 className='text-3xl font-bold'>HE</h1>
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
        <h1 className='text-xl flex space-x-4'>
          <Coins />
          {Credits}
          <span></span>
          <span></span>
          <ClerkHeader />
        </h1>
      </div>
    </header>
  )
  }
  
}
