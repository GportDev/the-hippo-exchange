import AssetCard from '@/components/AssetCard'
import { createFileRoute } from '@tanstack/react-router'
import fakeAssetsData from '@/lib/fake-assets.json'

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
  // Use fake data instead of API call
  const assets: Asset[] = fakeAssetsData as Asset[]

  // const handleAssetAdded = (newAsset: Asset) => {
    
  // }

  return (
    <section className='flex flex-col gap-4 p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>My Assets</h1>
        {/* <AddAssetModal onAssetAdded={handleAssetAdded} /> */}
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8'>
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
      </div>
    </section>
  )
}