import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  X,
  Package,
  Heart,
  AlertTriangle,
  Calendar,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";
import type { Asset, Maintenance } from "@/lib/Types";
import { HomeSkeleton } from "@/components/HomeSkeleton";
import { optimizeImageUrl } from "@/lib/images";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

type MaintenanceStatus = "overdue" | "pending" | "completed";
type MaintenanceWithStatus = Maintenance & { status: MaintenanceStatus };

function RouteComponent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const apiClient = useApiClient();

  const greeting = useMemo(() => {
    const greetings = [
      "Hello",
      "Welcome back",
      "Hi there",
      "Hey",
      "Greetings",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  // Data Fetching
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Asset[]>("/assets");
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    if (!user || assets.length === 0) return;

    const prefetch = async () => {
      const subset = assets.slice(0, 3);
      await Promise.all(
        subset.flatMap((asset) => [
          queryClient.prefetchQuery({
            queryKey: ["assets", asset.id],
            queryFn: () => apiClient<Asset>(`/assets/${asset.id}`),
          }),
          queryClient.prefetchQuery({
            queryKey: ["maintenance", "asset", asset.id],
            queryFn: () => apiClient<Maintenance[]>(`/assets/${asset.id}/maintenance`),
          }),
        ])
      );
    };

    void prefetch();
  }, [assets, apiClient, queryClient, user]);

  const {
    data: maintenanceTasks = [],
    isLoading: maintenanceLoading,
  } = useQuery<Maintenance[], Error, MaintenanceWithStatus[]>({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Maintenance[]>("/maintenance");
    },
    enabled: !!user,
    select: (data) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return data.map<MaintenanceWithStatus>((task) => {
        let status: MaintenanceStatus;
        if (task.isCompleted) {
          status = "completed";
        } else {
          const dueDate = new Date(task.maintenanceDueDate);
          dueDate.setHours(0, 0, 0, 0);
          status = dueDate < now ? "overdue" : "pending";
        }
        return { ...task, status };
      });
    },
  });

  // Derived State
  const isLoading = assetsLoading || maintenanceLoading;
  const pendingItems = maintenanceTasks.filter(
    (item) => item.status === "pending",
  );
  const overdueItems = maintenanceTasks.filter(
    (item) => item.status === "overdue",
  );
  const upcomingItems = maintenanceTasks
    .filter(
      (item) => item.status === "pending" || item.status === "overdue",
    )
    .sort(
      (a, b) =>
        new Date(a.maintenanceDueDate).getTime() -
        new Date(b.maintenanceDueDate).getTime(),
    )
    .slice(0, 5); // Cap the list to the top 5
  const favoriteAssets = assets.filter((asset) => asset.favorite);
  const totalAssetValue = assets.reduce(
    (sum, asset) => sum + (asset.purchaseCost || 0),
    0
  );

  // Overdue Items Toast Notification
  useEffect(() => {
    const toastId = "overdue-toast";
    const overdueItemsLength = overdueItems.length;
    if (!isLoading && overdueItemsLength > 0) {
      toast(
        (t) => (
          <div className="flex items-center justify-between w-full">
            <Link
              to="/maintenance"
              search={{ filter: "overdue" }}
              onClick={() => toast.dismiss(t.id)}
              className="flex items-center text-inherit no-underline"
            >
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-500" />
              <div className="flex flex-col">
                <p className="font-bold text-yellow-800">
                  {overdueItemsLength} Maintenance Item
                  {overdueItemsLength > 1 ? "s are" : " is"} Overdue
                </p>
                <p className="text-sm text-yellow-700">
                  Click here to address these items.
                </p>
              </div>
            </Link>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 rounded-full hover:bg-yellow-200 transition-colors ml-4 flex-shrink-0"
            >
              <X className="h-5 w-5 text-yellow-800" />
            </button>
          </div>
        ),
        {
          id: toastId,
          duration: Infinity,
          style: {
            background: "#FFFBEB", // bg-yellow-50
            border: "1px solid #FBBF24", // border-yellow-400
          },
        }
      );
    }
    return () => {
      toast.dismiss(toastId);
    };
  }, [isLoading, overdueItems.length]);

  // Helper function for status styling
  const getStatusClasses = (status: "overdue" | "pending" | "completed") => {
    switch (status) {
      case "overdue":
        return "text-red-800 bg-red-100";
      case "pending":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isLoaded || isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <main className="px-4 py-6 space-y-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                {greeting}, {user?.firstName}
              </h1>
              <p className="text-sm text-gray-500 sm:text-base">
                Here's what's happening with your assets today.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 xs:grid-cols-2 sm:w-auto sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
              <div className="rounded-lg border bg-white p-4 shadow-sm sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Total Assets</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">{assets.length}</div>
              </div>
              <div className="rounded-lg border bg-white p-4 shadow-sm sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Total Value</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                  ${totalAssetValue.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border bg-white p-4 shadow-sm sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <span>Upcoming Tasks</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                  {pendingItems.length}
                </div>
              </div>
              <div className="rounded-lg border bg-white p-4 shadow-sm sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Overdue Tasks</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                  {overdueItems.length}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                {/* Upcoming Maintenance Section */}
                <div className="rounded-xl bg-white p-4 shadow-md sm:p-6 lg:col-span-2">
                  <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
                    Upcoming Maintenance
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {isLoading ? (
                      <p className="text-gray-500">Loading maintenance items...</p>
                    ) : upcomingItems.length > 0 ? (
                      upcomingItems.map((item) => (
                        <Link
                          to="/assets/my-assets/$id"
                          params={{ id: item.assetId }}
                          key={item.id}
                          className="flex flex-col gap-3 rounded-lg bg-gray-50/40 p-3 transition-colors hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                        >
                          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                            <div className={`rounded-full p-2 ${getStatusClasses(item.status)}`}>
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900">
                                {item.maintenanceTitle}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.productName ?? ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <p
                              className={`rounded-full px-2 py-1 text-sm font-medium ${getStatusClasses(item.status)}`}
                            >
                              {new Date(item.maintenanceDueDate).toLocaleDateString()}
                            </p>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500">No upcoming maintenance items.</p>
                    )}
                  </div>
                </div>

                {/* Favorite Assets Section */}
                <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
                  <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
                    Favorite Assets
                  </h2>
                  <div className="space-y-3">
                    {isLoading ? (
                      <p className="text-gray-500">Loading assets...</p>
                    ) : favoriteAssets.length > 0 ? (
                      favoriteAssets.map((asset) => (
                        <Link
                          to="/assets/my-assets/$id"
                          params={{ id: asset.id }}
                          key={asset.id}
                          className="flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                        >
                          {asset.images && asset.images.length > 0 ? (
                            <img
                              src={optimizeImageUrl(asset.images[0], 400)}
                              alt={asset.itemName}
                              className="h-16 w-full rounded-md object-cover sm:h-12 sm:w-12"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-16 w-full items-center justify-center rounded-md bg-gray-100 sm:h-12 sm:w-12">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex flex-1 flex-col gap-1">
                            <p className="font-semibold text-gray-900">{asset.itemName}</p>
                            <p className="text-sm text-gray-500">{asset.brandName}</p>
                          </div>
                          <Heart className="h-5 w-5 text-red-500 sm:ml-auto" />
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No favorite assets yet. Click the heart on an asset to add it here.
                      </p>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
