import {} from 'react'
import { Link } from '@tanstack/react-router'

type AssetCardProps = {
  imgSrc: string
  imgAlt: string
  name: string
  detailed: string
}

const AssetCard: React.FC<AssetCardProps> = ({
  imgSrc,
  imgAlt,
  name,
  detailed,
}) => {
  return (
    <Link to={detailed} className='box-border w-60 rounded-2x'>
      <div className="box-border font-sans antialiased w-60 rounded-2xl shadow-[0px_10px_8px_#1b1919] flex flex-col m-2 bg-[rgba(61,60,82,1)] h-fit justify-center">
        {(imgSrc && imgAlt && <img src={imgSrc} alt={imgAlt} className='w-full rounded-2xl'/>)}
        {name && <h1 className='mx-[5%] my-2 text-2xl font-bold bg-gradient-to-r from-[#FEEF4C] to-white bg-clip-text text-transparent'>{name}</h1>}
      </div>
    </Link>
  )
}

export default AssetCard
