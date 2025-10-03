import { API_BASE_URL } from '@/lib/api';
import { useUser } from '@clerk/clerk-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'

type UserProfile = {
  phone: string
  address: string
  city: string
  state: string
}

// Zod schema for form validation
const profileFormSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const ProfilePage = () => {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)

  const { data, error: getProfileError, isLoading } = useQuery({
    queryKey: ['profileData'],
    queryFn: async (): Promise<UserProfile> => {
      return fetch(`${API_BASE_URL}/users/${user?.id}`, {
        headers: {
          'X-User-Id': `${user?.id}`
        }
      }).then((res) => res.json())
    },
  })

  if (getProfileError) {
    console.log(getProfileError)
    toast.error('Error fetching profile data')
  }

  const { mutateAsync, isPending } = useMutation({
      mutationFn: async (updatedData: ProfileFormValues) => {
        const response = await fetch(`${API_BASE_URL}/users/${user?.id}`, {
          method: 'PATCH',
          headers: {
            'X-User-Id': `${user?.id}`
          },
          body: JSON.stringify(updatedData),
        })
        if (!response.ok) {
          console.log(response)
          throw new Error('Failed to update profile')
        }
        return response.json()
      }
    })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: data ?? {
      phone: '',
      address: '',
      city: '',
      state: '',
    },
  })


  const onSubmit = async (formValues: ProfileFormValues) => {
    try {
      await mutateAsync(formValues)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Error updating profile: ${message}`)
    }
  }

  if (!user) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">
          Hello, <b>{user.firstName}</b>!
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-primary-gray text-primary-gray hover:bg-primary-gray/30 rounded cursor-pointer transition-colors"
          >
            Edit Profile
          </button>
          <button
            type="submit"
            form="profileForm"
            disabled={!isEditing || isPending}
            className="px-4 py-2 rounded cursor-pointer disabled:bg-primary-gray/60 disabled:cursor-not-allowed bg-primary-gray text-white hover:bg-primary-gray/90 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 p-4 border rounded-lg shadow-sm">
        <img src={user.imageUrl} alt="Profile" className="w-24 h-24 rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold">{user.fullName}</h2>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form id="profileForm" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={!isEditing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  {...register('address')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  {...register('state')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
            </div>
          </fieldset>
        </form>
      )}

    </div>
  )
}