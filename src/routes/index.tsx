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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl rounded-b-[50%] bg-primary-yellow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-160px] top-1/3 h-96 w-96 rounded-full bg-primary-yellow/10 blur-[120px]" />
        <div className="relative px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.9)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-primary-yellow/25 blur-[120px]" />
                <div className="absolute bottom-[-20px] right-[-20px] h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
              </div>
              <div className="relative grid gap-10 px-6 py-12 md:grid-cols-[1.05fr,0.95fr] lg:px-14">
                <div className="space-y-8">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                    Don't buy. Borrow.
                  </span>
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                      Borrow anything. Return better.
                    </h1>
                    <p className="max-w-xl text-base text-white/70 sm:text-lg">
                      Hippo Exchange connects you with neighbors who lend tools, gear, and equipment. Share responsibly, automate check-ins, and keep projects moving without the price tags.
                    </p>
                  </div>
                  <SignUpButton>
                    <button
                      type="button"
                      className="group inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-primary-yellow px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80"
                    >
                      Start borrowing today
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </SignUpButton>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative h-full w-full max-w-md">
                    <div className="absolute -left-6 top-0 hidden h-32 w-32 rounded-full bg-primary-yellow/20 blur-[90px] sm:block" />
                    <div className="space-y-6">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-yellow/15 text-primary-yellow">
                          🔨
                        </div>
                        <h3 className="text-lg font-semibold">Power up your projects</h3>
                        <p className="text-sm text-white/60">Reserve drills, sanders, and saws without the hardware store bill.</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-yellow/15 text-primary-yellow">
                          🌿
                        </div>
                        <h3 className="text-lg font-semibold">Refresh the yard</h3>
                        <p className="text-sm text-white/60">Borrow mowers, trimmers, and blowers the weekend you need them.</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-yellow/15 text-primary-yellow">
                          🛠️
                        </div>
                        <h3 className="text-lg font-semibold">Keep essentials handy</h3>
                        <p className="text-sm text-white/60">From socket sets to ladders, access communal gear in minutes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-6">
              <div className="flex flex-col gap-4 text-center">
                <h2 className="text-3xl font-semibold sm:text-4xl">Why neighbors trust Hippo Exchange</h2>
                <p className="mx-auto max-w-2xl text-white/70">
                  A sharing platform built for accountability, transparency, and joyful collaboration across your community.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    title: 'Save thousands together',
                    description: "Split the cost of specialized tools and equipment while keeping usage high and waste low.",
                    icon: '💰',
                  },
                  {
                    title: 'Build real connections',
                    description: 'Coordinate lending schedules, automate check-ins, and trade tips with verified neighbors.',
                    icon: '🤝',
                  },
                  {
                    title: 'Support sustainability',
                    description: 'Reuse existing equipment instead of buying new, lowering your carbon footprint with every borrow.',
                    icon: '🌍',
                  },
                ].map(({ title, description, icon }) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-[0_25px_70px_-50px_rgba(15,23,42,0.9)] backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-yellow/20 text-xl text-primary-yellow">
                      {icon}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
                    <p className="text-sm text-white/70">{description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
