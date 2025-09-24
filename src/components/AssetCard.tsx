import {} from 'react'
import { Link } from '@tanstack/react-router'
import "./Card.css"

type AssetCardProps = {
    imgSrc: string
    imgAlt: string
    name: string
    description: string
    detailed: string
}

const AssetCard: React.FC<AssetCardProps> = ({
  imgSrc,
  imgAlt,
  name,
  description,
  detailed,
}) => {
  return (
    <Link to={detailed} className='card-expand'>
      <div className='card-containter'>
        {(imgSrc && imgAlt && <img src={imgSrc} alt={imgAlt} className='card-img' />)}
        {name && <h1 className='card-name'>{name}</h1>}
        {description && <p className='card-description'>{description}</p>}
      </div>
    </Link>
  )
}

export default AssetCard
