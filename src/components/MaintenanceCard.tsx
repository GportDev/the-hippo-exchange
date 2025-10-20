import { Badge } from "@/components/ui/badge";
import type { Maintenance } from "@/lib/Types";
import { Calendar, Package } from "lucide-react";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

type MaintenanceStatus = "overdue" | "pending" | "completed";

interface MaintenanceCardProps {
	task: Maintenance & { status: MaintenanceStatus };
	imageUrl?: string;
	onUpdateStatus?: (maintenanceId: string, isCompleted: boolean) => void;
	onViewDetails: (task: Maintenance & { status: MaintenanceStatus }) => void;
}

export function MaintenanceCard({
	task,
	imageUrl,
	onUpdateStatus,
	onViewDetails,
}: MaintenanceCardProps) {
	const getStatusColor = () => {
		switch (task.status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "overdue":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			{/* Mobile Layout - Clickable card with top-right image and icon buttons */}
			<button
				type="button"
				className="sm:hidden relative group overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer w-full text-left"
				onClick={() => onViewDetails(task)}
			>
				<div className="absolute left-0 top-0 h-full w-1 bg-primary-gray" />
				<div className="flex gap-3">
					{/* Left side content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start gap-2 mb-2">
							<h3 className="text-base font-semibold text-primary-gray leading-tight">
								{task.maintenanceTitle}
							</h3>
						</div>
						<span
							className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} mb-2`}
						>
							{task.status === "pending"
								? "Upcoming"
								: task.status.charAt(0).toUpperCase() + task.status.slice(1)}
						</span>
						<p className="text-sm text-gray-600 mb-2 line-clamp-2">
							{task.maintenanceDescription || "No description provided."}
						</p>
						<div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
								<Package className="h-3 w-3 text-gray-500" />
								<span className="truncate max-w-[120px]">
									{task.brandName} {task.productName}
								</span>
							</span>
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
								<Calendar className="h-3 w-3" />
								<span>{formatDate(task.maintenanceDueDate)}</span>
							</span>
						</div>
					</div>

					{/* Right side - image only */}
					<div className="flex flex-col items-end gap-2 flex-shrink-0">
						{imageUrl && (
							<div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
								<img
									src={imageUrl}
									alt={task.productName}
									className="h-full w-full object-cover"
								/>
							</div>
						)}
					</div>
				</div>
			</button>

			{/* Desktop Layout - Keep original design */}
			<div className="hidden sm:block relative group overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-primary-yellow/40">
				<div className="absolute left-0 top-0 h-full w-1.5 bg-primary-gray" />
				<div className="flex items-start gap-4">
					{imageUrl && (
						<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
							<img
								src={imageUrl}
								alt={task.productName}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 mb-2">
							<h3 className="text-xl font-semibold text-primary-gray">
								{task.maintenanceTitle}
							</h3>
							<span
								className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
							>
								<Badge className={getStatusColor()}>
									{task.status === "pending"
										? "Upcoming"
										: task.status.charAt(0).toUpperCase() +
											task.status.slice(1)}
								</Badge>
							</span>
						</div>
						<p className="text-base text-gray-600 mb-2">
							{task.maintenanceDescription || "No description provided."}
						</p>
						<div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
								<Package className="h-3.5 w-3.5 text-gray-500" />
								<span>
									{task.brandName} {task.productName}
								</span>
							</span>
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
								<Calendar className="h-4 w-4" />
								<span>{formatDate(task.maintenanceDueDate)}</span>
							</span>
						</div>
					</div>
					<div className="ml-2 flex flex-col gap-3 flex-shrink-0">
						<button
							type="button"
							onClick={() => onViewDetails(task)}
							className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-lg hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
						>
							<span className="text-lg">⏵</span>
							View Details
						</button>
						{onUpdateStatus && !task.isCompleted && (
							<button
								type="button"
								className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-lg hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
								onClick={() => {
									if (task.id) {
										onUpdateStatus(task.id, true);
									}
								}}
							>
								<span className="text-lg">✓</span>
								Complete
							</button>
						)}
						{onUpdateStatus && task.isCompleted && (
							<button
								type="button"
								className="px-4 py-2 bg-primary-gray text-primary-yellow rounded-lg hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
								onClick={() => {
									if (task.id) {
										onUpdateStatus(task.id, false);
									}
								}}
							>
								<span className="text-lg">↺</span>
								Undo Complete
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
