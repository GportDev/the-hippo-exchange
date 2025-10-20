import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { useApiClient } from '@/hooks/useApiClient'
import { ArrowLeft, MapPin, Calendar, DollarSign, Camera, CheckCircle, Clock, ClipboardList, ShieldCheck } from 'lucide-react'
import type { Maintenance } from '@/lib/Types'
import { MaintenanceCard } from '@/components/MaintenanceCard'
import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';
import { optimizeImageUrl } from '@/lib/images';

// Structure of the asset object.
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

type MaintenanceStatus = "overdue" | "pending" | "completed";

export const Route = createFileRoute('/assets/my-assets/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const queryClient = useQueryClient()
  const apiClient = useApiClient()
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<(Maintenance & { status: MaintenanceStatus }) | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  // Redirect to home if not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />
  }
  
  const { data: asset, isLoading, isError } = useQuery<Asset>({
    queryKey: ['assets', id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      return apiClient<Asset>(`/assets/${id}`);
    },
    enabled: !!user && !!id, // Only run the query when user and id are available
  });

  const { data: maintenances = [], isLoading: isLoadingMaintenance } = useQuery<Maintenance[]>({
    queryKey: ["maintenance", "asset", id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Maintenance[]>(`/assets/${id}/maintenance`);
    },
    enabled: !!user && !!id,
  });

  const editMutation = useMutation<void, Error, Partial<Maintenance> & { id: string }>({
    mutationFn: async (updatedTask) => {
      if (!user) throw new Error("User not authenticated");
      const { id: taskId, ...payload } = updatedTask;
      
      // Clean the payload: convert null to undefined and handle empty strings
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => {
          if (value === null) {
            return [key, undefined];
          }
          if (value === "" && ['purchaseLocation'].includes(key)) {
            return [key, undefined];
          }
          // Ensure assetCategory has a valid value if it's empty
          if (key === 'assetCategory' && (value === "" || value === null || value === undefined)) {
            return [key, "Electronics"];
          }
          return [key, value];
        })
      );
      
      await apiClient(`/maintenance/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(cleanPayload),
        skipJsonParsing: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", id] });
      setEditModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      console.error("Failed to update maintenance task:", error);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error("User not authenticated");
      await apiClient(`/maintenance/${taskId}`, {
        method: "DELETE",
        skipJsonParsing: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", id] });
      setSelectedTask(null);
    },
  });

  const handleUpdateStatus = (taskId: string, isCompleted: boolean) => {
    editMutation.mutate({ id: taskId, isCompleted });
  };

  const handleViewDetails = (task: Maintenance & { status: MaintenanceStatus }) => setSelectedTask(task);
  const handleCloseDetails = () => setSelectedTask(null);
  const handleEdit = (task: Maintenance) => {
    const taskWithStatus = maintenanceItemsWithStatus.find(t => t.id === task.id);
    setSelectedTask(taskWithStatus || { ...task, status: 'pending' });
    setEditModalOpen(true);
  };
  const handleSaveEdit = (updatedTask: Maintenance) => {
    if (updatedTask.id) {
      editMutation.mutate({ ...updatedTask, id: updatedTask.id });
    }
  };
  const handleDelete = (taskId: string) => deleteMutation.mutate(taskId);

const maintenanceItemsWithStatus = useMemo(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return maintenances
      .map((task) => {
        let status: MaintenanceStatus;
        if (task.isCompleted) {
          status = "completed";
        } else if (new Date(task.maintenanceDueDate) < now) {
          status = "overdue";
        } else {
          status = "pending";
        }
        return { ...task, status };
      })
      .sort((a, b) => {
        const dateA = new Date(a.maintenanceDueDate).getTime();
        const dateB = new Date(b.maintenanceDueDate).getTime();
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'completed') return dateB - dateA;
        return dateA - dateB;
      });
  }, [maintenances]);

  const openMaintenance = useMemo(
    () => maintenanceItemsWithStatus.filter((task) => task.status !== 'completed'),
    [maintenanceItemsWithStatus],
  );

  const nextMaintenanceDue = useMemo(() => {
    if (openMaintenance.length === 0) return null;
    return [...openMaintenance].sort(
      (a, b) => new Date(a.maintenanceDueDate).getTime() - new Date(b.maintenanceDueDate).getTime(),
    )[0];
  }, [openMaintenance]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white flex items-center justify-center">
        <p className="text-white/70">Loading asset...</p>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Asset Not Found</h1>
          <p className="text-white/70">The asset you're looking for doesn't exist or could not be loaded.</p>
          <Link 
            to="/assets/my-assets" 
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary-yellow/40 hover:bg-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const heroStats = [
    {
      label: 'Purchase Cost',
      value: formatCurrency(asset.purchaseCost),
      description: 'Original investment value',
      Icon: DollarSign,
    },
    {
      label: 'Next Maintenance',
      value: nextMaintenanceDue ? formatDate(nextMaintenanceDue.maintenanceDueDate) : 'No tasks scheduled',
      description: nextMaintenanceDue ? nextMaintenanceDue.maintenanceTitle : 'Create a task to plan upkeep',
      Icon: Calendar,
    },
    {
      label: 'Current Location',
      value: asset.currentLocation || 'Unspecified',
      description: 'Where borrowers will pick up and return',
      Icon: MapPin,
    },
  ];

  const heroFeatures = [
    {
      title: 'Define clear borrowing rules',
      description: 'Share availability windows and care expectations right alongside your listing.',
      Icon: ClipboardList,
    },
    {
      title: 'Track maintenance history',
      description: 'Every completed task builds a paper trail for future borrowers.',
      Icon: ShieldCheck,
    },
    {
      title: 'Stay ahead of upkeep',
      description: 'Schedule recurring tasks so high-demand gear stays in top condition.',
      Icon: Clock,
    },
  ];

  const statusStyles = (() => {
    switch (asset.status) {
      case 'available':
        return 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200';
      case 'borrowed':
      case 'in_repair':
        return 'border-amber-300/40 bg-amber-400/10 text-amber-200';
      default:
        return 'border-white/20 bg-white/10 text-white/70';
    }
  })();

  const formattedStatus = asset.status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl rounded-b-[50%] bg-primary-yellow/20 blur-[120px]" />
        <div className="relative px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/85 to-slate-900/60 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -left-14 top-8 h-64 w-64 rounded-full bg-primary-yellow/25 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-yellow/15 blur-[120px]" />
              </div>
              <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
                <div className="space-y-8">
                  <Link
                    to="/assets/my-assets"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to assets
                  </Link>

                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                      {asset.category}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        {asset.itemName}
                      </h1>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}>
                        <CheckCircle className="h-4 w-4" />
                        {formattedStatus}
                      </span>
                    </div>
                    {asset.brandName && (
                      <p className="text-lg text-white/70">{asset.brandName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {heroStats.map(({ label, value, Icon, description }) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
                          <Icon className="h-4 w-4 text-primary-yellow" />
                          {label}
                        </div>
                        <p className="text-xl font-semibold text-white">{value}</p>
                        <p className="mt-2 text-xs text-white/60">{description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {heroFeatures.map(({ title, description, Icon }) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10">
                        <div className="mb-3 inline-flex rounded-full bg-white/10 p-2 text-primary-yellow">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs text-white/60">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative animate-scale-in">
                    <div className="absolute -inset-10 rounded-[2.75rem] bg-primary-yellow/20 blur-[100px]" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-xl backdrop-glow">
                      {asset.images && asset.images.length > 0 ? (
                        <img
                          src={optimizeImageUrl(asset.images[0], 900)}
                          alt={asset.itemName}
                          className="block h-auto w-full max-w-lg animate-fade-up transition duration-500 hover:-translate-y-1 hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-80 w-[28rem] items-center justify-center text-white/60">
                          <Camera className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-6">
                {asset.images && asset.images.length > 1 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Gallery</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {asset.images.slice(1, 7).map((image, galleryIndex) => (
                        <div key={`${asset.id}-gallery-${galleryIndex}-${image}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          <img
                            src={optimizeImageUrl(image, 500)}
                            alt={`${asset.itemName} ${galleryIndex + 2}`}
                            className="block h-auto w-full transition duration-500 hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                  <h3 className="mb-3 text-lg font-semibold text-white">Condition overview</h3>
                  <p className="text-sm leading-relaxed text-white/70">{asset.conditionDescription}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Ownership & location</h3>
                  <div className="space-y-4 text-sm text-white/70">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary-yellow" />
                      <span>Purchased for {formatCurrency(asset.purchaseCost)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary-yellow" />
                      <span>{formatDate(asset.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary-yellow" />
                      <span>{asset.currentLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Maintenance history</h2>
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-yellow px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80 sm:w-auto"
                >
                  Add maintenance
                </Button>
              </div>

              <div className="space-y-4">
                {isLoadingMaintenance ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/60 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                    Loading maintenance tasks...
                  </div>
                ) : maintenanceItemsWithStatus.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center text-white/60 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)]">
                    No maintenance history for this asset yet. Create a task to set expectations for borrowers.
                  </div>
                ) : (
                  maintenanceItemsWithStatus.map((maintenance) => (
                    <MaintenanceCard
                      key={maintenance.id}
                      task={maintenance}
                      imageUrl={asset.images?.[0] || '/public/placeholder.jpg'}
                      onUpdateStatus={handleUpdateStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <AddMaintenanceModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        assetId={id}
      />

      {selectedTask && !isEditModalOpen && (
        <MaintenanceDetailsModal
          task={selectedTask}
          onClose={handleCloseDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <EditMaintenanceModal
        task={isEditModalOpen ? selectedTask : null}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
