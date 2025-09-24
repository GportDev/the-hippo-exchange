import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/MyAssetsPage/_root')({
  component: MyAssetsPage,
})

function MyAssetsPage() {
  console.log('Rendering MyAssetsPage')

  return (
    <div style={{ padding: '2rem', fontSize: '1.2rem' }}>
      <h1>hello</h1>
      <p>hello2</p>
    </div>
  )
}

