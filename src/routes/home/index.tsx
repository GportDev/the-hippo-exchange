import { createFileRoute } from '@tanstack/react-router'
import { X, Package, Star, AlertTriangle, Calendar, ChevronRight } from 'lucide-react'
import { Link } from "@tanstack/react-router"
import { useQuery, 
  // useMutation, useQueryClient 
} from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
// import { AssetCard } from "@/components/AssetCard";
import { useEffect } from "react";
import toast from 'react-hot-toast';

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
  // const queryClient = useQueryClient();
  // const [, setEditingAsset] = useState<Asset | null>(null);


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
  
  /*
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
    */
  
    /*
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
    */

  const upcomingItems = maintenanceData.filter(item => item.status === 'upcoming' || item.status === 'overdue');
  const overdueItems = maintenanceData.filter(item => item.status === 'overdue')
  const favoriteAssets = assets.filter(asset => asset.favorite === true)

  useEffect(() => {
    const toastId = 'overdue-toast';
    if (overdueItems.length > 0) {
      toast(
        (t) => (
          <div className="flex items-center justify-between w-full">
            <Link
              to="/maintenance"
              onClick={() => toast.dismiss(t.id)}
              className="flex items-center text-inherit no-underline"
            >
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-500" />
              <div className="flex flex-col">
                <p className="font-bold text-yellow-800">
                  {overdueItems.length} Maintenance Item{overdueItems.length > 1 ? 's are' : ' is'} Overdue
                </p>
                <p className="text-sm text-yellow-700">Click here to address these items.</p>
              </div>
            </Link>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-yellow-200 transition-colors ml-4 flex-shrink-0">
              <X className="h-5 w-5 text-yellow-800" />
            </button>
          </div>
        ),
        {
          id: toastId,
          duration: Infinity,
          style: {
            background: '#FFFBEB', // bg-yellow-50
            border: '1px solid #FBBF24', // border-yellow-400
          },
        }
      );
    }
    // Clean up the toast when the component unmounts or the condition is no longer met
    return () => {
      toast.dismiss(toastId);
    };
  }, [overdueItems.length]);


  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-800 bg-red-100';
      case 'upcoming':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full bg-gray-50/50">
      <main className="p-6 space-y-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Maintenance Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Maintenance</h2>
            <div className="space-y-4">
              {upcomingItems.length > 0 ? (
                upcomingItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusClasses(item.status)}`}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.itemName}</p>
                        <p className="text-sm text-gray-600">{item.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getPriorityIcon(item.priority)}
                      <p className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusClasses(item.status)}`}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming maintenance items.</p>
              )}
            </div>
          </div>

          {/* Favorite Assets Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Favorite Assets</h2>
            <div className="space-y-3">
              {favoriteAssets.length > 0 ? (
                favoriteAssets.map(asset => (
                  <Link to="/assets/my-assets/$id" params={{ id: asset.id }} key={asset.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    {asset.images && asset.images.length > 0 ? (
                      <img src={asset.images[0]} alt={asset.itemName} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{asset.itemName}</p>
                      <p className="text-sm text-gray-500">{asset.brandName}</p>
                    </div>
                    <Star className="h-5 w-5 text-yellow-400 ml-auto" />
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">No favorite assets yet. Click the star on an asset to add it here.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

