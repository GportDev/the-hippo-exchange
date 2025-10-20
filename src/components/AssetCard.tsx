import { Link } from '@tanstack/react-router';
import { Heart, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { optimizeImageUrl } from '@/lib/images';

interface ShortAsset {
  id: string;
  itemName: string;
  category: string;
  images: string[];
  status: string;
  favorite: boolean;
}

interface AssetCardProps {
  asset: ShortAsset;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (asset: ShortAsset) => void;
}

export function AssetCard({ asset, onToggleFavorite, onDelete, onEdit }: AssetCardProps) {
  const getStatusColor = () => {
    switch (asset.status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'borrowed':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'unlisted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-lg ${
        asset.status === 'unlisted' ? 'opacity-50' : ''
      }`}
    >
      <Link to="/assets/my-assets/$id" params={{ id: asset.id }} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={optimizeImageUrl(asset.images?.[0]) || '/public/placeholder.jpg'}
            alt={asset.itemName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{asset.category}</p>
            <h3 className="font-semibold leading-tight text-primary-gray">
              <Link to="/assets/my-assets/$id" params={{ id: asset.id }}>
                {asset.itemName}
              </Link>
            </h3>
          </div>
          <Badge className={`ml-2 shrink-0 ${getStatusColor()}`}>
            {asset.status
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </Badge>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggleFavorite(asset.id, !asset.favorite)}
        className="absolute top-3 right-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-600 backdrop-blur-sm transition hover:bg-white hover:text-red-500"
      >
        <Heart className={`h-5 w-5 ${asset.favorite ? 'fill-red-500 text-red-500' : ''}`} />
      </button>
      <div className="absolute top-3 left-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full bg-white/70 p-1.5 text-gray-600 backdrop-blur-sm transition hover:bg-white"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onEdit(asset)} className="flex items-center gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(asset.id)} className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
