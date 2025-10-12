import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";


import { MaintenaceCard } from "@/components/MaintenanceCard"

interface MaintenanceItem {
  id: string;
  assetId: string;
  brandName: string;
  productName: string;
  purchaseLocation: string;
  costPaid: number;
  maintenanceDueDate: string;
  maintenanceTitle: string;
  maintenanceDescription: string;
  maintenanceStatus: string;
  preserveFromPrior: boolean;
  requiredTools: string[];
  toolLocation: string;
}

export const Route = createFileRoute('/maintenance/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {user, isSignedIn, isLoaded } = useUser()
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'pending' | 'completed'>('all')
  const queryClient = useQueryClient();

  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />
  }

  const { data: maintenances = [], isLoading } = useQuery<MaintenanceItem[]>({
    queryKey: ["maintenace", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE_URL}/maintenance`, {
        headers: { "X-User-Id": user.id },
      });
      console.log()
      if (!res.ok) throw new Error("Failed to fetch maintenance");
      const data = await res.json();
      // Normalize status values coming from the API so UI mapping is consistent.
      // Convert values like "In Repair" or "in-repair" to "in_repair".
      if (Array.isArray(data)) {
        return data.map((maintenance: MaintenanceItem) => ({
          ...maintenance,
        }));
      }
      return data;
    },
    enabled: !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async (updatedMaintenance: MaintenanceItem) => {
      if (!user) throw new Error("User not authenticated");
      // The API expects the full asset object on PUT, but without the ID in the body.
      const { id, ...maintenanceData } = updatedMaintenance;
      const res = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify(maintenanceData),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to update maintenance: ${res.status} ${res.statusText} - ${errorText}`
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenace", user?.id] });
    },
  });

  const handleToggleComplete = (id: string, newStatus: string) => {
    const maintenanceToUpdate = maintenances.find((maintenace) => maintenace.id === id);
    if (maintenanceToUpdate) {
      // Create a new object with the updated favorite status
      const updatedMaintenance = { ...maintenanceToUpdate, maintenanceStatus: newStatus };
      completeMutation.mutate(updatedMaintenance);
    }
  };

  const filteredItems = maintenances.filter((maintenace) => {
    const matchesStatus =
      activeFilter === "all" || maintenace.maintenanceStatus === activeFilter;
    return matchesStatus;
  });
  return (
    <div className='bg-gray-50 p-6'>
      <section className='mx-auto max-w-7xl'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-primary-gray'>My Maintenance</h1>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-6 border-b border-gray-200 mb-6'>
          {[
            { key: 'all', label: 'All' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'pending', label: 'Upcoming' },
            { key: 'completed', label: 'History' }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key as 'all' | 'overdue' | 'pending' | 'completed')}
              className={`pb-2 px-1 font-semibold text-lg border-b-2 transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Maintenance Items List */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className="text-center text-primary-gray">Loading assets...</div>
          )
           : filteredItems.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <p className='text-lg'>No maintenance items found for this filter.</p>
            </div>
          ) : (
            filteredItems.map((maintenance) => (
              <MaintenaceCard
              key = {maintenance.id}
              maintenance={maintenance}
              onToggleComplete={handleToggleComplete}
              />
              ))
          )}
        </div>
      </section>
    </div>
  )
}