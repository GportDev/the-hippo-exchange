import { createFileRoute } from '@tanstack/react-router'
import logo from '/Hypo-logo.png'

// Forward '/' as the route for this file, the file will export the component App
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>
          Welcome to The Hypo Exchange
        </p>
      </header>
    </div>
  )
}
