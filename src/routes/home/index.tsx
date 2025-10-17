import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { apiFetch } from "@/lib/api";
import type { Asset, Maintenance } from "@/lib/Types";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoaded, isSignedIn } = useUser();

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
  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch(user.id, "/assets");
    },
    enabled: !!user,
  });

  const { data: maintenanceTasks = [], isLoading: maintenanceLoading } =
    useQuery< (Maintenance & { status: "overdue" | "pending" | "completed" })[] >({
      queryKey: ["maintenance", user?.id],
      queryFn: async () => {
        if (!user) return [];
        return apiFetch(user.id, "/maintenance");
      },
      enabled: !!user,
      select: (data: Maintenance[]) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return data.map((task) => {
          let status: "overdue" | "pending" | "completed";
          if (task.isCompleted) {
            status = "completed";
          } else {
            const dueDate = new Date(task.maintenanceDueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < now) {
              status = "overdue";
            } else {
              status = "pending";
            }
          }
          return { ...task, status };
        });
      },
    });

  // Derived State
  const isLoading = assetsLoading || maintenanceLoading;
  const pendingItems = maintenanceTasks.filter(
      (item) => item.status === "pending"
    );
    const overdueItems = maintenanceTasks.filter(
      (item) => item.status === "overdue"
    );
  const upcomingItems = maintenanceTasks
    .filter(
      (item) => item.status === "pending" || item.status === "overdue"
    )
    .sort((a, b) => new Date(a.maintenanceDueDate).getTime() - new Date(b.maintenanceDueDate).getTime())
    .slice(0, 5); // Cap the list to the top 5
  const favoriteAssets = assets.filter((asset) => asset.favorite);
  const totalAssetValue = assets.reduce(
    (sum, asset) => sum + (asset.purchaseCost || 0),
    0
  );

  // Overdue Items Toast Notification
  useEffect(() => {
    const toastId = "overdue-toast";
    const overdueItemsLength = overdueItems.length-pendingItems.length;
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

  return (
    <div className="h-full bg-gray-50/50">
      <main className="p-6 space-y-8">
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                {greeting}, {user?.firstName}
                </h1>
                <p className="text-gray-500">
                Here's what's happening with your assets today.
                </p>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Total Assets</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                    {assets.length}
                </div>
                </div>
                <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Total Value</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                    ${totalAssetValue.toLocaleString()}
                </div>
                </div>
                <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <span>Upcoming Tasks</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                    {pendingItems.length}
                </div>
                </div>
                <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Overdue Tasks</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary-gray">
                    {overdueItems.length-pendingItems.length}
                </div>
                </div>
            </div>
            </div>
            <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Upcoming Maintenance Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Upcoming Maintenance
                </h2>
                <div className="space-y-4">
                    {isLoading ? (
                    <p className="text-gray-500">Loading maintenance items...</p>
                    ) : upcomingItems.length > 0 ? (
                    upcomingItems.map((item) => (
                        <Link
                        to="/assets/my-assets/$id"
                        params={{ id: item.assetId }}
                        key={item.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-center gap-4">
                            <div
                            className={`p-2 rounded-full ${getStatusClasses(
                                item.status
                            )}`}
                            >
                            <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                            <p className="font-semibold text-gray-900">
                                {item.maintenanceTitle}
                            </p>
                            <p className="text-sm text-gray-600">
                                {item.maintenanceTitle}
                            </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p
                            className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusClasses(
                                item.status
                            )}`}
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
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
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
                        className="flex items-center gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                        {asset.images && asset.images.length > 0 ? (
                            <img
                            src={asset.images[0]}
                            alt={asset.itemName}
                            className="w-12 h-12 rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-gray-900">
                            {asset.itemName}
                            </p>
                            <p className="text-sm text-gray-500">
                            {asset.brandName}
                            </p>
                        </div>
                        <Heart className="h-5 w-5 text-red-500 fill-red-500 ml-auto" />
                        </Link>
                    ))
                    ) : (
                    <p className="text-gray-500">
                        No favorite assets yet. Click the heart on an asset to add it
                        here.
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

