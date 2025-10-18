import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/loans/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/loans/"!</div>
}
