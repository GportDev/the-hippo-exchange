import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Heart, Package, Search } from "lucide-react";

export function MyAssetsSkeleton() {
	return (
		<div className="bg-gray-50 p-6">
			<div className="mx-auto max-w-7xl">
				<header className="mb-8">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<Skeleton className="h-9 w-48" />
							<Skeleton className="mt-2 h-4 w-64" />
						</div>
						<Skeleton className="h-10 w-32" />
					</div>
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Package className="h-5 w-5 text-blue-600" />
								<span>Total Assets</span>
							</div>
							<Skeleton className="mt-1 h-7 w-12" />
						</div>
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<DollarSign className="h-5 w-5 text-green-600" />
								<span>Total Value</span>
							</div>
							<Skeleton className="mt-1 h-7 w-24" />
						</div>
						<div className="rounded-lg border bg-white p-4 shadow-sm">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Heart className="h-5 w-5 text-red-600" />
								<span>Favorites</span>
							</div>
							<Skeleton className="mt-1 h-7 w-10" />
						</div>
					</div>
				</header>

				<div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex flex-wrap items-center gap-4">
						<div className="relative flex-1 min-w-[300px]">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Skeleton className="h-10 w-full pl-10" />
						</div>
						<Skeleton className="h-10 w-full sm:w-[180px]" />
						<Skeleton className="h-10 w-28" />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, index) => (
						<div
							key={index}
							className="rounded-lg border bg-white p-4 shadow-sm"
						>
							<Skeleton className="h-40 w-full" />
							<div className="mt-4">
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="mt-2 h-4 w-1/2" />
								<Skeleton className="mt-2 h-4 w-1/4" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
