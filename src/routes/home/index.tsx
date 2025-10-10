import { createFileRoute, useSearch } from '@tanstack/react-router'
import { MoveLeft, X, Package } from 'lucide-react'
import { Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { AssetCard } from "@/components/AssetCard";
import { useState } from "react";

type MaintenanceItem = {
  id: string
  itemName: string
  action: string
  dueDate: string
  status: 'overdue' | 'upcoming' | 'completed'
  priority: 'high' | 'medium' | 'low'
  category: string
}

interface Asset {
  id: string;
  itemName: string;
  brandName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  currentLocation: string;
  images: string[];
  conditionDescription: string;
  ownerUserId: string;
  status: string;
  favorite: boolean;
}

const maintenanceData: MaintenanceItem[] = [
  {
    id: '1',
    itemName: 'Predator 350 W Power Station',
    action: 'Recharge Station',
    dueDate: '2024-01-15',
    status: 'overdue',
    priority: 'high',
    category: 'Electronics'
  },
  {
    id: '2',
    itemName: 'Sony A7 III Camera Body',
    action: 'Clean sensor and check firmware',
    dueDate: '2024-01-20',
    status: 'upcoming',
    priority: 'medium',
    category: 'Electronics'
  },
  {
    id: '3',
    itemName: 'MacBook Pro 14-inch M3',
    action: 'Update software and clean keyboard',
    dueDate: '2024-01-25',
    status: 'upcoming',
    priority: 'high',
    category: 'Electronics'
  },
  {
    id: '4',
    itemName: 'Dyson V15 Detect Vacuum',
    action: 'Replace filter and clean brush',
    dueDate: '2024-01-10',
    status: 'completed',
    priority: 'medium',
    category: 'Home & Garden'
  },
  {
    id: '5',
    itemName: 'KitchenAid Stand Mixer',
    action: 'Lubricate gears and clean attachments',
    dueDate: '2024-01-30',
    status: 'upcoming',
    priority: 'low',
    category: 'Home & Garden'
  },
  {
    id: '6',
    itemName: 'Peloton Bike',
    action: 'Tighten bolts and clean bike',
    dueDate: '2024-01-05',
    status: 'completed',
    priority: 'medium',
    category: 'Sports & Fitness'
  }
]


export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})



function RouteComponent() {

  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);


  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE_URL}/assets`, {
        headers: { "X-User-Id": user.id },
      });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json();
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
      mutationFn: async (updatedAsset: Asset) => {
        if (!user) throw new Error("User not authenticated");
        const { id, ...assetData } = updatedAsset;
        const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id,
          },
          body: JSON.stringify(assetData),
        });
        if (!res.ok) {
          throw new Error("Failed to update asset");
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
        setEditingAsset(null); // Close modal on success
      },
    });
  
    const deleteMutation = useMutation({
      mutationFn: async (assetId: string) => {
        if (!user) throw new Error("User not authenticated");
        const res = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
          method: "DELETE",
          headers: { "X-User-Id": user.id },
        });
        if (!res.ok) throw new Error("Failed to delete asset");
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
      },
    });
  
    const favoriteMutation = useMutation({
      mutationFn: async (updatedAsset: Asset) => {
        if (!user) throw new Error("User not authenticated");
        // The API expects the full asset object on PUT, but without the ID in the body.
        const { id, ...assetData } = updatedAsset;
        const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id,
          },
          body: JSON.stringify(assetData),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to update asset: ${res.status} ${res.statusText} - ${errorText}`
          );
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["assets", user?.id] });
      },
    });
  
    const handleEditAsset = (asset: Asset) => {
      setEditingAsset(asset);
    };
  
    const handleDeleteAsset = (id: string) => {
      if (window.confirm("Are you sure you want to delete this asset?")) {
        deleteMutation.mutate(id);
      }
    };
  
    const handleToggleFavorite = (id: string, isFavorite: boolean) => {
      const assetToUpdate = assets.find((asset) => asset.id === id);
      if (assetToUpdate) {
        // Create a new object with the updated favorite status
        const updatedAsset = { ...assetToUpdate, favorite: isFavorite };
        favoriteMutation.mutate(updatedAsset);
      }
    };

  const upcomingItems = maintenanceData.filter(item => item.status === 'upcoming' || item.status === 'overdue');
  const overdueItems = maintenanceData.filter(item => item.status === 'overdue')
  const favoriteAssets = assets.filter(asset => asset.favorite === true)

  const [hidePopup, togglePopup] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50'
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="mx-auto max-w-7xl p-6" >
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-bold'>Home</h1>
        {overdueItems.length > 0 && hidePopup === false && (
          <div className="flex-shrink-0 bg-primary-yellow border border-gray-200 rounded-lg w-80">  
          <div className="h-1/2 flex items-center justify-between rounded-t-lg bg-chart-4 border-b border-gray-300 px-4">
            <div className="flex items-center gap-2">
              <Link 
                to="/maintenance"
                className="inline-flex items-center text-inherit no-underline"
              >
                <MoveLeft size="1.5em" />
              </Link>
              <h1 className="font-bold">Important!</h1>
            </div>
            <button onClick={() => togglePopup(!hidePopup)} className="hover:cursor-pointer">
              <X size="1.5em" />
            </button>
          </div>
          <div className="h-1/2 flex items-start justify-start">
            <p>
              Overdue maintenance on {overdueItems[0].itemName}
              {overdueItems.length > 1 && (
                <span> and {overdueItems.length - 1} more.</span>
              )}
            </p>
          </div>
        </div >
        )}
    </div>
    <div className='py-2'></div>
    <div className='flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg'>
      <h1 className='text-2xl'>Upcoming Maintenance</h1> 
          {upcomingItems.length === 0 ? (
            <div className='py-12'>
              <h2>You have no upcoming maintenance!</h2>
            </div>
          ) : (
          <ul className="flex overflow-x-auto space-x-4 p-4">
      {upcomingItems.map((item) => (
        <li
          key={item.id}
          className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow w-80"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{item.itemName}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                </span>
              </div>
              <p className="text-gray-600 mb-2">{item.action}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Due: {formatDate(item.dueDate)}</span>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>
          </div>
        </li>
      ))}
        </ul>
      )}
    </div>
    <div className='py-2'></div>
    <div className='flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg'>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">Favorite Assets</h1>
        </div>
        <div>
          {isLoading ? (
            <div className="text-center">Loading assets...</div>
          ) : favoriteAssets.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No assets found
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {assets.length > 0
                  ? "Try adjusting your filters to see more results."
                  : "Get started by adding your first asset."}
              </p>
            </div>
          ) : (
            <div className="flex overflow-x-auto space-x-4 p-4">
              {favoriteAssets.map((asset) => (
                <div key={asset.id} className="flex-shrink-0 w-80">
                  <AssetCard
                    asset={asset}
                    onDelete={handleDeleteAsset}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={() => handleEditAsset(asset)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    <div>
    
      
      
    </div>
  </div>
  )
      

  
}

