import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home/index 2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/"!</div>
}
