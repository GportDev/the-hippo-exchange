import { SignUpButton, useUser } from '@clerk/clerk-react'
import { createFileRoute, Navigate } from '@tanstack/react-router'

// Forward '/' as the route for this file, the file will export the component App
export const Route = createFileRoute('/')({
  component: App,
})

function App() {

  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return <Navigate to="/assets/my-assets" />
  }

  return (
    <div className="bg-[#f4f4f4] font-sans text-black">
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="absolute -top-1/2 right-[-20%] size-[800px] rounded-full bg-[radial-gradient(circle,rgba(254,239,76,0.2)_0%,transparent_70%)]" />
        <div className="absolute left-[-5%] top-[20%] size-[200px] bg-[radial-gradient(circle,#000_2px,transparent_2px)] bg-[length:20px_20px] opacity-10" />

        <div className="container mx-auto px-5">
          <div className="grid min-h-[60vh] items-center gap-16 md:grid-cols-2">
            <div className="relative z-10 text-center md:text-left">
              <h1 className="mb-6 text-primary-gray bg-clip-text text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                Don't buy. Borrow.
              </h1>
              <p className="mx-auto mb-10 max-w-md text-lg text-black/80 md:mx-0">
                Access thousands of tools and equipment from your neighbors.
                From lawn mowers to power tools, get what you need when you need
                it.
              </p>
              <SignUpButton>
                <button
                  type='button'
                  className="group cursor-pointer inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#FEEF4C] to-white px-8 py-4 text-lg font-semibold text-primary-gray shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  Start Borrowing
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </SignUpButton>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative size-80 md:size-96 lg:size-[400px]">
                <div className="animate-float absolute left-0 top-0 w-52 rounded-2xl border border-primary-gray/20 bg-white/10 p-6 backdrop-blur-md md:w-52">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FEEF4C] text-2xl">
                    🔨
                  </div>
                  <h3 className="text-md font-semibold">Power Tools</h3>
                  <p className="text-xs">
                    Drills, saws, sanders & more
                  </p>
                </div>
                <div
                  className="animate-float absolute right-0 top-28 w-52 rounded-2xl border border-primary-gray/20 bg-white/10 p-6 backdrop-blur-md"
                  style={{ animationDelay: '2s' }}
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FEEF4C] text-2xl">
                    🌿
                  </div>
                  <h3 className="text-md font-semibold">Garden Tools</h3>
                  <p className="text-xs">
                    Mowers, trimmers, blowers
                  </p>
                </div>
                <div
                  className="animate-float absolute -bottom-3 left-12 w-52 rounded-2xl border border-primary-gray/20 bg-white/10 p-6 backdrop-blur-md"
                  style={{ animationDelay: '4s' }}
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FEEF4C] text-2xl">
                    🛠️
                  </div>
                  <h3 className="text-md font-semibold">Hand Tools</h3>
                  <p className="text-xs">
                    Hammers, wrenches, screwdrivers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black/20 py-20 md:py-24">
        <div className="container mx-auto px-5">
          <h2 className="mb-5 text-center text-4xl font-bold md:text-5xl">
            Why Choose Hippo Exchange?
          </h2>
          <p className="mx-auto max-w-2xl text-center text-lg">
            Join thousands of neighbors sharing tools and equipment in a
            sustainable, cost-effective way.
          </p>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <div className="rounded-2xl border border-primary-gray/10 bg-[#F4F4F4] p-8 text-center transition-all hover:-translate-y-1 hover:border-[rgba(254,239,76,0.3)]">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEEF4C] to-white text-2xl text-primary-gray">
                💰
              </div>
              <h3 className="mb-2 text-xl font-bold">Save Money</h3>
              <p className="">
                Why buy expensive tools you'll rarely use? Borrow from neighbors
                and save hundreds of dollars.
              </p>
            </div>

            <div className="rounded-2xl border border-primary-gray/10 bg-[#F4F4F4] p-8 text-center transition-all hover:-translate-y-1 hover:border-[rgba(254,239,76,0.3)]">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEEF4C] to-white text-2xl text-primary-gray">
                🤝
              </div>
              <h3 className="mb-2 text-xl font-bold">Build Community</h3>
              <p className="">
                Connect with your neighbors, share resources, and strengthen
                your local community bonds.
              </p>
            </div>

            <div className="rounded-2xl border border-primary-gray/10 bg-[#F4F4F4] p-8 text-center transition-all hover:-translate-y-1 hover:border-[rgba(254,239,76,0.3)]">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEEF4C] to-white text-2xl text-primary-gray">
                🌍
              </div>
              <h3 className="mb-2 text-xl font-bold">Go Green</h3>
              <p className="">
                Reduce waste and environmental impact by sharing resources
                instead of buying new items.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

