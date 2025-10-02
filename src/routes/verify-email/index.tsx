import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignUp } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/verify-email/')({
  component: VerifyEmailComponent,
})

function VerifyEmailComponent() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate({ from: '/verify-email' })

  const onPressVerify = async () => {
    if (!isLoaded || isLoading) {
      return
    }

    setIsLoading(true)
    // Clear previous errors
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        navigate({ to: '/' })
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      
      // Parse Clerk error and display it
      if (err?.errors && Array.isArray(err.errors)) {
        const errorMessage = err.errors[0]?.message || 'Verification failed. Please try again.'
        setError(errorMessage)
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-300">
      <div className="w-full max-w-md p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Verify Your Email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A verification code has been sent to your email address.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
              />
              {error && (
                <p className="text-red-500">{error}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              onClick={onPressVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" aria-label="Loading spinner">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
