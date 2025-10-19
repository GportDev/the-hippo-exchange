import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export function HomeSkeleton() {
  return (
    <div className="h-full bg-gray-50/50">
      <main className="p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Maintenance Skeleton */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32 mt-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Assets Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-md" />
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                  <Star className="h-5 w-5 text-gray-300 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
