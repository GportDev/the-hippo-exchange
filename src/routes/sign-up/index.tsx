import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignUp, useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { ArrowRight, Layers3, ShieldCheck, Sparkles } from 'lucide-react'

const signUpSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(3, 'Username must be at least 3 characters long.'),
  email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address.'),
  firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty.'),
  lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty.'),
  password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match!",
  path: ["confirmPassword"],
});

type SignUpSchema = z.infer<typeof signUpSchema>

export const Route = createFileRoute('/sign-up/')({
  component: SignUpComponent,
})

function SignUpComponent() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isSignedIn, isLoaded: isUserLoaded } = useUser()
  const [clerkErrors, setClerkErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const highlights = [
    {
      title: 'Grow your lending circle',
      description: 'Invite neighbors to borrow gear and track every request with ease.',
      Icon: Sparkles,
    },
    {
      title: 'Protect every asset',
      description: 'Attach maintenance plans so items are returned in top condition.',
      Icon: ShieldCheck,
    },
    {
      title: 'Catalog equipment fast',
      description: 'Bulk upload listings, photos, and lending terms in minutes.',
      Icon: Layers3,
    },
  ]

  // Redirect to assets if already signed in
  if (isUserLoaded && isSignedIn) {
    return <Navigate to="/home" replace />
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })
  const heading = pendingVerification ? 'Verify your email' : 'Create your account'
  const subheading = pendingVerification
    ? 'Enter the code we sent to unlock your Hippo Exchange profile.'
    : 'Tell us about yourself to start lending and borrowing smarter.'

  useEffect(() => {
    const subscription = watch((value) => {
      const { password, confirmPassword, ...rest } = value
      localStorage.setItem('signUpFormCache', JSON.stringify(rest))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    const cachedValues = localStorage.getItem('signUpFormCache')
    if (cachedValues) {
      const parsedValues = JSON.parse(cachedValues)
      setValue('username', parsedValues.username)
      setValue('firstName', parsedValues.firstName)
      setValue('lastName', parsedValues.lastName)
      setValue('email', parsedValues.email)
    }
  }, [setValue])

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

  const onSubmit = async (data: SignUpSchema) => {
    if (!isLoaded || isLoading) {
      return
    }

    setIsLoading(true)
    // Clear previous errors
    setClerkErrors({})

    try {
      const result = await signUp.create({
        username: data.username,
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      
      const fieldErrors = parseClerkError(err)
      setClerkErrors(fieldErrors)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) {
      return
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: (e.target as HTMLFormElement).code.value,
      })
      if (completeSignUp.status !== 'complete') {
        /*  investigate the signup process flow.  */
        console.log(JSON.stringify(completeSignUp, null, 2))
      }
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      const fieldErrors = parseClerkError(err)
      setClerkErrors(fieldErrors)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-4xl rounded-b-[45%] bg-primary-yellow/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-48 bottom-12 h-80 w-80 rounded-full bg-primary-yellow/15 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-140px] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary-yellow/10 blur-[120px]" />
      <div className="relative w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -left-20 top-12 h-64 w-64 rounded-full bg-primary-yellow/25 blur-[120px]" />
            <div className="absolute bottom-[-40px] right-[-40px] h-80 w-80 rounded-full bg-primary-yellow/15 blur-[140px]" />
          </div>
          <div className="relative grid gap-12 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                Hippo Exchange
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Join the lending collective
                </h1>
                <p className="max-w-md text-base text-white/70 sm:text-lg">
                  Set up your Hippo Exchange profile to share durable goods, automate upkeep reminders, and empower your neighborhood.
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
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-primary-yellow/60 hover:text-primary-yellow"
                >
                  Already have an account?
                  <ArrowRight className="h-4 w-4" />
                </a>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Equip. Share. Repeat.
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-white">{heading}</h2>
                  <p className="mt-2 text-sm text-white/60">{subheading}</p>
                </div>
                {pendingVerification ? (
                  <form className="space-y-6" onSubmit={onVerify}>
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-white/80">
                        Verification code
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        required
                        placeholder="Enter the 6-digit code"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                      />
                      <div className="min-h-[1.25rem] text-xs text-rose-300">{clerkErrors.code || '\u00A0'}</div>
                    </div>
                    <Button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-yellow px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80"
                    >
                      Verify email
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white/80">
                          Username
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                          {...register('username')}
                        />
                        <div className="min-h-[1.25rem] text-xs text-rose-300">
                          {errors.username?.message || clerkErrors.username || '\u00A0'}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white/80">
                            First name
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="First name"
                            className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                            {...register('firstName')}
                          />
                          <div className="min-h-[1.25rem] text-xs text-rose-300">
                            {errors.firstName?.message || clerkErrors.firstName || '\u00A0'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white/80">
                            Last name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Last name"
                            className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                            {...register('lastName')}
                          />
                          <div className="min-h-[1.25rem] text-xs text-rose-300">
                            {errors.lastName?.message || clerkErrors.lastName || '\u00A0'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                          {...register('email')}
                        />
                        <div className="min-h-[1.25rem] text-xs text-rose-300">
                          {errors.email?.message || clerkErrors.emailAddress || '\u00A0'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/80">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                          {...register('password')}
                        />
                        <div className="min-h-[1.25rem] text-xs text-rose-300">
                          {errors.password?.message || clerkErrors.password || '\u00A0'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white/80">
                          Confirm password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Repeat your password"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary-yellow"
                          {...register('confirmPassword')}
                        />
                        <div className="min-h-[1.25rem] text-xs text-rose-300">
                          {errors.confirmPassword?.message || '\u00A0'}
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
                          Creating account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </Button>
                  </form>
                )}
                {!pendingVerification && (
                  <div className="mt-6 text-center text-sm text-white/70">
                    <p>
                      Already have an account?{' '}
                      <a href="/sign-in" className="font-semibold text-primary-yellow transition hover:text-primary-yellow/80">
                        Log in
                      </a>
                    </p>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 hidden h-44 w-44 rounded-full bg-primary-yellow/25 blur-[100px] sm:block" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
