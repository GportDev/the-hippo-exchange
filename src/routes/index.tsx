import { createFileRoute } from '@tanstack/react-router'
import logo from '/Hypo-logo.png'

// Forward '/' as the route for this file, the file will export the component App
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-white text-primary-gray text-3xl">
        <img
          src={logo}
          className="h-32 pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <h2>
          Welcome to The Hypo Exchange
        </h2>
      </header>
    </div>
  )
}
