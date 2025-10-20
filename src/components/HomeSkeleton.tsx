import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertTriangle,
	Calendar,
	DollarSign,
	Heart,
	Package,
} from "lucide-react";

export function HomeSkeleton() {
	return (
		<div className="h-full">
			<main className="p-4 sm:p-6 space-y-4">
				<div className="mx-auto max-w-7xl">
					{/* Header Section */}
					<div className="mb-5">
						<Skeleton className="h-10 w-64 mb-1" /> {/* Greeting */}
						<Skeleton className="h-5 w-80" /> {/* Description */}
					</div>

					{/* Stats Cards - Compressed Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
						{/* Total Assets Card */}
						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
							<div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
							<Package className="h-7 w-7 text-blue-600 mb-2 opacity-50" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">
								Total Assets
							</div>
							<Skeleton className="h-8 w-12" />
						</div>

						{/* Total Value Card */}
						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
							<div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10" />
							<DollarSign className="h-7 w-7 text-green-600 mb-2 opacity-50" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">
								Total Value
							</div>
							<Skeleton className="h-8 w-20" />
						</div>

						{/* Upcoming Card */}
						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm">
							<div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full -mr-10 -mt-10" />
							<Calendar className="h-7 w-7 text-yellow-600 mb-2 opacity-50" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">
								Upcoming
							</div>
							<Skeleton className="h-8 w-12" />
						</div>

						{/* Overdue Card */}
						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
							<div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-10 -mt-10" />
							<AlertTriangle className="h-7 w-7 text-red-600 mb-2 opacity-50" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">
								Overdue
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						{/* Upcoming Maintenance Section */}
						<div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50/50 p-5 rounded-2xl shadow-md border border-gray-200">
							<div className="flex items-center justify-between mb-4">
								<Skeleton className="h-7 w-56" /> {/* Section Title */}
								<Skeleton className="h-5 w-20" /> {/* View All */}
							</div>
							<div className="space-y-2">
								{[0, 1, 2, 3, 4].map((id) => (
									<div
										key={`home-upcoming-${id}`}
										className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100"
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<Skeleton className="h-10 w-10 rounded-lg" />
											<div className="flex-1 min-w-0">
												<Skeleton className="h-4 w-32 mb-1" /> {/* Title */}
												<Skeleton className="h-3 w-40" /> {/* Description */}
											</div>
										</div>
										<div className="flex items-center gap-2 ml-3">
											<Skeleton className="h-6 w-16 rounded-full" />{" "}
											{/* Date */}
											<Skeleton className="h-4 w-4" /> {/* Chevron */}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Favorite Assets Section */}
						<div className="bg-gradient-to-br from-white to-gray-50/50 p-5 rounded-2xl shadow-md border border-gray-200">
							<div className="flex items-center justify-between mb-4">
								<Skeleton className="h-7 w-40" /> {/* Section Title */}
								<Skeleton className="h-5 w-20" /> {/* View All */}
							</div>
							<div className="space-y-2">
								{[0, 1, 2, 3].map((id) => (
									<div
										key={`home-fav-${id}`}
										className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100"
									>
										<Skeleton className="w-12 h-12 rounded-lg" />
										<div className="flex-1 min-w-0">
											<Skeleton className="h-4 w-24 mb-1" /> {/* Asset Name */}
											<Skeleton className="h-3 w-20" /> {/* Brand Name */}
										</div>
										<Heart className="h-4 w-4 text-red-500 opacity-30" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
