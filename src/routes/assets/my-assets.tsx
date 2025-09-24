import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/assets/my-assets')({
  component: MyAssetsPage,
})

function MyAssetsPage() {

  return (
    <div style={{ padding: '2rem', fontSize: '1.2rem' }}>
      <h1>hello</h1>
      <p>hello2</p>
    </div>
  )
}

