import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Package,
  Star,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Asset, Maintenance } from "@/lib/Types";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoaded, isSignedIn } = useUser();

  // Data Fetching
  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiFetch<Asset[]>(user.id, "/assets");
    },
    enabled: !!user,
  });

  const { data: maintenanceTasks = [], isLoading: maintenanceLoading } =
    useQuery< (Maintenance & { status: "overdue" | "pending" | "completed" })[] >({
      queryKey: ["maintenance", user?.id],
      queryFn: async () => {
        if (!user) return [];
        return apiFetch<Maintenance[]>(user.id, "/maintenance");
      },
      enabled: !!user,
      select: (data: Maintenance[]) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return data.map((task) => {
          let status: "overdue" | "pending" | "completed";
          if (task.isCompleted) {
            status = "completed";
          } else if (new Date(task.maintenanceDueDate) < now) {
            status = "overdue";
          } else {
            status = "pending";
          }
          return { ...task, status };
        });
      },
    });

  // Derived State
  const isLoading = assetsLoading || maintenanceLoading;
  const upcomingItems = maintenanceTasks
    .filter(
      (item) => item.status === "pending" || item.status === "overdue"
    )
    .sort((a, b) => new Date(a.maintenanceDueDate).getTime() - new Date(b.maintenanceDueDate).getTime())
    .slice(0, 5); // Cap the list to the top 5

  const overdueItems = maintenanceTasks.filter(
    (item) => item.status === "overdue"
  );
  const favoriteAssets = assets.filter((asset) => asset.favorite);

  // Overdue Items Toast Notification
  useEffect(() => {
    const toastId = "overdue-toast";
    if (!isLoading && overdueItems.length > 0) {
      toast.custom(
        (id) => (
          <div className="flex items-center justify-between w-full bg-yellow-50 border border-yellow-400 rounded p-3">
            <Link
              to="/maintenance"
              search={{ filter: "overdue" }}
              onClick={() => toast.dismiss(id)}
              className="flex items-center text-inherit no-underline"
            >
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-500" />
              <div className="flex flex-col">
                <p className="font-bold text-yellow-800">
                  {overdueItems.length} Maintenance Item
                  {overdueItems.length > 1 ? "s are" : " is"} Overdue
                </p>
                <p className="text-sm text-yellow-700">
                  Click here to address these items.
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => toast.dismiss(id)}
              className="p-1 rounded-full hover:bg-yellow-200 transition-colors ml-4 flex-shrink-0"
            >
              <X className="h-5 w-5 text-yellow-800" />
            </button>
          </div>
        ),
        { id: toastId, duration: Number.POSITIVE_INFINITY }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="bg-white p-6 rounded-xl shadow-md">
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
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <Star className="h-5 w-5 text-yellow-400 ml-auto" />
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">
                  No favorite assets yet. Click the star on an asset to add it
                  here.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
