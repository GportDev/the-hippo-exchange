import { UserButton } from '@clerk/clerk-react'
import { ProfilePage } from './ProfilePage'

const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
      <title>Dot Icon</title>
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  )
}

export default function CustomUserButton() {
  return (
    <header>
      <UserButton>
        {/* You can pass the content as a component */}
        <UserButton.UserProfilePage label="My Info" url="custom" labelIcon={<DotIcon />}>
          <ProfilePage />
        </UserButton.UserProfilePage>
        <UserButton.UserProfilePage label="account" />
        <UserButton.UserProfilePage label="security" />
      </UserButton>
    </header>
  )
}