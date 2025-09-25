import AssetCard from '@/components/AssetCard'
import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/assets/my-assets/')({
  component: MyAssetsPage,
})

interface Asset {
  itemName: string
  brandName: string
  category: string
  purchaseDate: string
  purchaseCost: number
  currentLocation: string
  images: string[]
  conditionDescription: string
  status: string
}

function MyAssetsPage() {
  const { user } = useUser()

  const { data: assets, error: getAssetsError, isLoading } = useQuery({
    queryKey: ['my-assets'],
    queryFn: async (): Promise<Asset[]> => {
      return fetch('https://thehippoexchange.com/api/assets', {
        headers: {
          'X-User-Id': `${user?.id}`
        }
      }).then((res) => res.json())
    },
  })

  if (getAssetsError) {
    console.log(getAssetsError)
    toast.error('Error fetching assets')
  }

  // const handleAssetAdded = (newAsset: Asset) => {
    
  // }

  return (
    <section className='flex flex-col gap-4 p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>My Assets</h1>
        {/* <AddAssetModal onAssetAdded={handleAssetAdded} /> */}
        {isLoading && <p>Loading...</p>}
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8'>
        {assets ? (
          <>
            {assets.map((asset, index) => (
              <AssetCard
                key={`${asset.itemName}-${index}`}
                itemName={asset.itemName}
                brandName={asset.brandName}
                category={asset.category}
                purchaseDate={asset.purchaseDate}
                purchaseCost={asset.purchaseCost}
                currentLocation={asset.currentLocation}
                images={asset.images}
                conditionDescription={asset.conditionDescription}
                status={asset.status}
                link={`/assets/my-assets/${index}`}
              />
            ))}
          </>
        ) : (
          <div className='flex items-center justify-center'>
            <p className='text-gray-500'>No assets found</p>
          </div>
        )}
      </div>
    </section>
  )
}