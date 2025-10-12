import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignUp, useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
})

type SignUpSchema = z.infer<typeof signUpSchema>

export const Route = createFileRoute('/sign-up/')({
  component: SignUpComponent,
})

function SignUpComponent() {
  const { isLoaded, signUp } = useSignUp()
  const { isSignedIn, isLoaded: isUserLoaded } = useUser()
  const [clerkErrors, setClerkErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to assets if already signed in
  if (isUserLoaded && isSignedIn) {
    return <Navigate to="/assets/my-assets" replace />
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  })

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
      await signUp.create({
        username: data.username,
        emailAddress: data.email,
        password: data.password,
      })

    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      
      const fieldErrors = parseClerkError(err)
      setClerkErrors(fieldErrors)
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <div className="flex flex-col md:flex-row min-h-screen bg-primary-yellow">
      <div className="flex flex-col justify-center md:w-1/2 p-12 text-white bg-primary-gray md:rounded-r-[6rem] rounded-b-[4rem] md:rounded-bl-none">
        <h1 className="text-6xl font-bold text-primary-yellow">Hippo Exchange</h1>
        <p className="text-2xl text-white">don't buy. borrow.</p>
      </div>
      <div className="flex flex-col items-center justify-center md:w-1/2 ">
        <div className="w-full max-w-md p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-center text-primary-gray">Create Account</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 rounded-md">
              <div className='space-y-4 text-primary-gray'>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  className="border border-primary-gray"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-red-500">{errors.username.message}</p>
                )}
                {clerkErrors.username && (
                  <p className="text-red-500">{clerkErrors.username}</p>
                )}
              </div>
              <div className='space-y-4 text-primary-gray'>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="border border-primary-gray"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email.message}</p>
                )}
                {clerkErrors.emailAddress && (
                  <p className="text-red-500">{clerkErrors.emailAddress}</p>
                )}
              </div>
              <div className='space-y-4 text-primary-gray'>
                <Label htmlFor="password ">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="border border-primary-gray"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
                {clerkErrors.password && (
                  <p className="text-red-500">{clerkErrors.password}</p>
                )}
              </div>
              <div className='space-y-4 text-primary-gray'>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  className="border border-primary-gray"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-4'>
                            <Button type="submit" className="w-full text-primary-yellow bg-primary-gray cursor-pointer" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" aria-label="Loading spinner">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing Up...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </div>
          </form>
          <div className="text-sm text-center">
            <p className='text-primary-gray'>
              Already Have an Account?{' '}
              <a href="/sign-in" className="text-primary-gray underline-offset-2 underline hover:text-indigo-500">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
