import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignIn, useUser } from '@clerk/clerk-react'
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/sign-in/')({
  component: SignInComponent,
})

function SignInComponent() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { isSignedIn, isLoaded: isUserLoaded } = useUser()
  const navigate = useNavigate({ from: '/sign-in' })
  const [clerkErrors, setClerkErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const highlights = [
    {
      title: 'Stay organized',
      description: 'Monitor maintenance tasks and borrower activity at a glance.',
      Icon: ShieldCheck,
    },
    {
      title: 'Borrow smarter',
      description: 'Track lending history and keep your community gear in rotation.',
      Icon: Clock,
    },
    {
      title: 'Unlock perks',
      description: 'Earn trust badges and priority access by completing upkeep.',
      Icon: Sparkles,
    },
  ]

  // Redirect to assets if already signed in
  if (isUserLoaded && isSignedIn) {
    return <Navigate to="/assets/my-assets" replace />
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const parseClerkError = (error: unknown) => {
    const fieldErrors: Record<string, string> = {}
    
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      for (const err of error.errors) {
        if (err && typeof err === 'object' && 'meta' in err && err.meta && typeof err.meta === 'object' && 'paramName' in err.meta) {
          fieldErrors[err.meta.paramName as string] = (err as { message: string }).message
        }
      }
    }
    
    return fieldErrors
  }

  const onSubmit = async (data: Record<string, string>) => {
    if (!isLoaded || isLoading) {
      return
    }

    setIsLoading(true)
    // Clear previous errors
    setClerkErrors({})

    try {
      const result = await signIn.create({
        identifier: data.username,
        password: data.password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate({ to: '/' })
      } else {
        /*Investigate why the login failed */
        console.log(result)
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      
      const fieldErrors = parseClerkError(err)
      setClerkErrors(fieldErrors)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-4xl rounded-b-[45%] bg-primary-yellow/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-16 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary-yellow/10 blur-[120px]" />
      <div className="relative w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-primary-yellow/25 blur-[120px]" />
            <div className="absolute bottom-[-30px] right-[-30px] h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
          </div>
          <div className="relative grid gap-12 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                Hippo Exchange
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Welcome back
                </h1>
                <p className="max-w-md text-base text-white/70 sm:text-lg">
                  Sign in to manage assets, log maintenance, and stay ahead of borrower expectations.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map(({ title, description, Icon }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10"
                  >
                    <div className="mb-3 inline-flex rounded-full bg-white/10 p-2 text-primary-yellow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-white/60">{description}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-primary-yellow/60 hover:text-primary-yellow"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" />
                </a>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Don't buy. Borrow.
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-white">Log In</h2>
                  <p className="mt-2 text-sm text-white/60">
                    Enter your credentials to access your command center.
                  </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white/80">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Username"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                        {...register('username', { required: true })}
                      />
                      <div className="min-h-[1.25rem] text-sm text-rose-300">
                        {errors.username ? <p>Username is required</p> : <p>{clerkErrors.identifier || '\u00A0'}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/80">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                        {...register('password', { required: true })}
                      />
                      <div className="min-h-[1.25rem] text-sm text-rose-300">
                        {errors.password ? <p>Password is required</p> : <p>{clerkErrors.password || '\u00A0'}</p>}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-yellow px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin text-slate-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          role="img"
                          aria-label="Loading spinner"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-white/70">
                  <p>
                    New here?{' '}
                    <a href="/sign-up" className="font-semibold text-primary-yellow transition hover:text-primary-yellow/80">
                      Start here
                    </a>
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-8 -top-8 hidden h-40 w-40 rounded-full bg-primary-yellow/20 blur-[90px] sm:block" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
