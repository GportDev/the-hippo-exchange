import { Link } from '@tanstack/react-router'
import type React from 'react'

type AssetCardProps = {
  itemName: string
  brandName?: string
  category?: string
  purchaseDate?: string
  purchaseCost?: number
  currentLocation: string
  images: string[]
  conditionDescription?: string
  status?: string
  link: string
}

const AssetCard: React.FC<AssetCardProps> = ({
  itemName,
  brandName,
  purchaseCost,
  currentLocation,
  images,
  link,
}) => {
  return (
    <Link to={link} className='w-60 rounded-2xl'>
      <div className="w-60 rounded-2xl flex flex-col gap-2 justify-center text-slate-800">
        <img src={images[0]} alt={itemName} className='aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200'/>
        <p className='text-sm'>{brandName}</p>
        <h1 className='text-2xl font-bold'>{itemName}</h1>
        <p className='text-lg font-semibold'>${purchaseCost}</p>
        <p className='text-xs'>{currentLocation}</p>
      </div>
    </Link>
  )
}

export default AssetCard