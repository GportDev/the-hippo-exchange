import { Skeleton } from "@/components/ui/skeleton";

export function MaintenanceSkeleton() {
	return (
		<div className="bg-gray-50 p-6 min-h-screen">
			<section className="mx-auto max-w-7xl">
				<div className="flex justify-between items-center mb-6">
					<div>
						<Skeleton className="h-9 w-64" />
						<Skeleton className="h-4 w-80 mt-2" />
					</div>
				</div>

				<div className="flex gap-6 border-b border-gray-200 mb-4">
					{[0, 1, 2, 3].map((id) => (
						<div key={`maintenance-tab-${id}`} className="relative px-1">
							<Skeleton className="h-8 w-24" />
						</div>
					))}
					<div className="flex-grow" />
					<Skeleton className="h-14 w-32 mb-2 mr-5" />
				</div>

				<div className="space-y-4">
					{[0, 1, 2, 3, 4].map((id) => (
						<div
							key={`maintenance-item-${id}`}
							className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
						>
							<Skeleton className="h-16 w-16 rounded-md" />
							<div className="flex-grow">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2 mt-2" />
							</div>
							<div className="flex flex-col items-end">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-8 w-20 mt-2" />
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
