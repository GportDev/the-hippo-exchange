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
		<div className="h-full bg-gray-50/50">
			<main className="p-6 space-y-8">
				<div className="mx-auto max-w-7xl">
					{/* Header Skeleton */}
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-4">
						<div>
							<Skeleton className="h-9 w-64 mb-2" /> {/* Greeting */}
							<Skeleton className="h-5 w-80" /> {/* Description */}
						</div>
						{/* Stats Cards Skeleton */}
						<div className="grid grid-cols-1 xs:grid-cols-2 sm:flex gap-3 sm:gap-6 w-full sm:w-auto">
							{/* Total Assets Card */}
							<div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Package className="h-5 w-5 text-blue-600 opacity-50" />
									<span>Total Assets</span>
								</div>
								<Skeleton className="mt-1 h-7 w-12" />
							</div>
							{/* Total Value Card */}
							<div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<DollarSign className="h-5 w-5 text-green-600 opacity-50" />
									<span>Total Value</span>
								</div>
								<Skeleton className="mt-1 h-7 w-24" />
							</div>
							{/* Upcoming Tasks Card */}
							<div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Calendar className="h-5 w-5 text-yellow-600 opacity-50" />
									<span>Upcoming Tasks</span>
								</div>
								<Skeleton className="mt-1 h-7 w-10" />
							</div>
							{/* Overdue Tasks Card */}
							<div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm w-full sm:w-48">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<AlertTriangle className="h-5 w-5 text-red-600 opacity-50" />
									<span>Overdue Tasks</span>
								</div>
								<Skeleton className="mt-1 h-7 w-10" />
							</div>
						</div>
					</div>

					<div className="space-y-6 sm:space-y-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
							{/* Upcoming Maintenance Skeleton */}
							<div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
								<Skeleton className="h-8 w-64 mb-4" /> {/* Section Title */}
								<div className="space-y-4">
									{Array.from({ length: 5 }).map((_, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50"
										>
											<div className="flex items-center gap-4">
												<Skeleton className="h-10 w-10 rounded-full" />{" "}
												{/* Icon placeholder */}
												<div>
													<Skeleton className="h-5 w-48" /> {/* Item Title */}
													<Skeleton className="h-4 w-32 mt-2" />{" "}
													{/* Item Description */}
												</div>
											</div>
											<div className="flex items-center gap-4">
												<Skeleton className="h-7 w-24" /> {/* Date */}
												<Skeleton className="h-5 w-5" /> {/* Chevron */}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Favorite Assets Skeleton */}
							<div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
								<Skeleton className="h-8 w-48 mb-4" /> {/* Section Title */}
								<div className="space-y-3">
									{Array.from({ length: 3 }).map((_, index) => (
										<div
											key={index}
											className="flex items-center gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
										>
											<Skeleton className="w-12 h-12 rounded-md" />{" "}
											{/* Image placeholder */}
											<div>
												<Skeleton className="h-5 w-32" /> {/* Asset Name */}
												<Skeleton className="h-4 w-24 mt-2" />{" "}
												{/* Brand Name */}
											</div>
											<Heart className="h-5 w-5 text-gray-300 ml-auto opacity-50" />{" "}
											{/* Star Icon */}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
