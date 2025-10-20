import { AddMaintenanceModal } from "@/components/AddMaintenanceModal";
import { EditMaintenanceModal } from "@/components/EditMaintenanceModal";
import { MaintenanceCard } from "@/components/MaintenanceCard";
import { MaintenanceDetailsModal } from "@/components/MaintenanceDetailsModal";
import { Button } from "@/components/ui/button";
import type { Maintenance } from "@/lib/Types";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	Camera,
	CheckCircle,
	DollarSign,
	MapPin,
	Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

const determineMaintenanceStatus = (
	task: Maintenance,
	isCompleted: boolean,
): Maintenance["maintenanceStatus"] => {
	if (isCompleted) {
		return "Completed";
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const dueDate = new Date(task.maintenanceDueDate);
	dueDate.setHours(0, 0, 0, 0);

	return dueDate < today ? "Overdue" : "Upcoming";
};

export const Route = createFileRoute("/assets/my-assets/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { user, isSignedIn, isLoaded } = useUser();
	const queryClient = useQueryClient();
	const [isAddModalOpen, setAddModalOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState<
		(Maintenance & { status: MaintenanceStatus }) | null
	>(null);
	const [isEditModalOpen, setEditModalOpen] = useState(false);

	// Redirect to home if not signed in
	if (isLoaded && !isSignedIn) {
		return <Navigate to="/" replace />;
	}

	const {
		data: asset,
		isLoading,
		isError,
	} = useQuery<Asset>({
		queryKey: ["assets", id],
		queryFn: async () => {
			if (!user) throw new Error("User not authenticated");

			const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
				headers: {
					"X-User-Id": user.id,
				},
			});
			if (!res.ok) {
				throw new Error("Failed to fetch asset");
			}
			return res.json();
		},
		enabled: !!user && !!id, // Only run the query when user and id are available
	});

	const { data: maintenances = [], isLoading: isLoadingMaintenance } = useQuery<
		Maintenance[]
	>({
		queryKey: ["maintenance", "asset", id],
		queryFn: async () => {
			if (!user) return [];
			return apiFetch(user.id, `/assets/${id}/maintenance`);
		},
		enabled: !!user && !!id,
	});

	const editMutation = useMutation<
		Maintenance,
		Error,
		Partial<Maintenance> & { id: string }
	>({
		mutationFn: async (updatedTask) => {
			if (!user) throw new Error("User not authenticated");
			const { id: taskId, ...payload } = updatedTask;

			// Clean the payload: convert null to undefined and handle empty strings
			const cleanPayload = Object.fromEntries(
				Object.entries(payload).map(([key, value]) => {
					if (value === null) {
						return [key, undefined];
					}
					if (value === "" && ["purchaseLocation"].includes(key)) {
						return [key, undefined];
					}
					// Ensure assetCategory has a valid value if it's empty
					if (
						key === "assetCategory" &&
						(value === "" || value === null || value === undefined)
					) {
						return [key, "Electronics"];
					}
					return [key, value];
				}),
			);

			return apiFetch(user.id, `/maintenance/${taskId}`, {
				method: "PUT",
				body: JSON.stringify(cleanPayload),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", id] });
			toast.success("Maintenance task updated successfully!");
			setEditModalOpen(false);
			setSelectedTask(null);
		},
		onError: (error) => {
			toast.error(`Failed to update maintenance task: ${error.message}`);
		},
	});

	const deleteMutation = useMutation<void, Error, string>({
		mutationFn: async (taskId: string) => {
			if (!user) throw new Error("User not authenticated");
			return apiFetch(user.id, `/maintenance/${taskId}`, {
				method: "DELETE",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", id] });
			toast.success("Maintenance task deleted successfully!");
			setSelectedTask(null);
		},
		onError: (error) => {
			toast.error(`Failed to delete maintenance task: ${error.message}`);
		},
	});

	const updateMaintenanceStatusMutation = useMutation<
		Maintenance,
		Error,
		{ taskId: string; payload: Partial<Maintenance> },
		{ originalTask?: Maintenance; previous?: Maintenance[] }
	>({
		mutationFn: async ({ taskId, payload }) => {
			if (!user) throw new Error("User not authenticated");
			return apiFetch(user.id, `/maintenance/${taskId}`, {
				method: "PATCH",
				body: JSON.stringify(payload),
			});
		},
		onMutate: async (variables) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: ["maintenance", "asset", id] }),
				queryClient.cancelQueries({ queryKey: ["maintenance", user?.id] }),
			]);
			const previous = queryClient.getQueryData<Maintenance[]>([
				"maintenance",
				"asset",
				id,
			]);
			const originalTask = previous?.find(
				(task) => task.id === variables.taskId,
			);
			return { originalTask, previous };
		},
		onSuccess: async (_data, variables, context) => {
			if (!user) {
				return;
			}

			const originalTask = context?.originalTask;
			if (variables.payload.isCompleted && originalTask?.preserveFromPrior) {
				const adjustedDueDate = new Date(originalTask.maintenanceDueDate);
				const interval = originalTask.recurrenceInterval || 0;
				switch (originalTask.recurrenceUnit) {
					case "Days":
						adjustedDueDate.setDate(adjustedDueDate.getDate() + interval);
						break;
					case "Weeks":
						adjustedDueDate.setDate(adjustedDueDate.getDate() + interval * 7);
						break;
					case "Months":
						adjustedDueDate.setMonth(adjustedDueDate.getMonth() + interval);
						break;
					case "Years":
						adjustedDueDate.setFullYear(
							adjustedDueDate.getFullYear() + interval,
						);
						break;
				}

				const nextTaskPayload = {
					assetId: originalTask.assetId,
					brandName: originalTask.brandName,
					productName: originalTask.productName,
					purchaseLocation: originalTask.purchaseLocation || undefined,
					assetCategory: originalTask.assetCategory,
					costPaid: originalTask.costPaid,
					maintenanceDueDate: adjustedDueDate.toISOString(),
					maintenanceTitle: originalTask.maintenanceTitle,
					maintenanceDescription: originalTask.maintenanceDescription,
					maintenanceStatus: "Upcoming" as Maintenance["maintenanceStatus"],
					preserveFromPrior: originalTask.preserveFromPrior,
					isCompleted: false,
					requiredTools: originalTask.requiredTools,
					toolLocation: originalTask.toolLocation,
					recurrenceUnit: originalTask.recurrenceUnit,
					recurrenceInterval: originalTask.recurrenceInterval,
				};

				try {
					await apiFetch(
						user.id,
						`/assets/${originalTask.assetId}/maintenance`,
						{
							method: "POST",
							body: JSON.stringify(nextTaskPayload),
						},
					);
				} catch (error) {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to schedule next recurring maintenance task.",
					);
				}
			}

			queryClient.invalidateQueries({ queryKey: ["maintenance", "asset", id] });
			queryClient.invalidateQueries({ queryKey: ["maintenance", user?.id] });
			toast.success("Maintenance task updated successfully!");
		},
		onError: (error, _variables, context) => {
			toast.error(`Update failed: ${error.message}`);
			if (context?.previous) {
				queryClient.setQueryData(
					["maintenance", "asset", id],
					context.previous,
				);
			}
		},
	});

	const handleUpdateStatus = (taskId: string, isCompleted: boolean) => {
		const targetTask = maintenanceItemsWithStatus.find(
			(task) => task.id === taskId,
		);
		if (!targetTask) {
			return;
		}

		updateMaintenanceStatusMutation.mutate({
			taskId,
			payload: {
				isCompleted,
				maintenanceStatus: determineMaintenanceStatus(targetTask, isCompleted),
			},
		});
	};

	const handleViewDetails = (
		task: Maintenance & { status: MaintenanceStatus },
	) => setSelectedTask(task);
	const handleCloseDetails = () => setSelectedTask(null);
	const handleEdit = (task: Maintenance) => {
		const taskWithStatus = maintenanceItemsWithStatus.find(
			(t) => t.id === task.id,
		);
		setSelectedTask(taskWithStatus || { ...task, status: "pending" });
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
				if (a.status === "completed" && b.status !== "completed") return 1;
				if (a.status !== "completed" && b.status === "completed") return -1;
				if (a.status === "completed" && b.status === "completed")
					return dateB - dateA;
				return dateA - dateB;
			});
	}, [maintenances]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	if (isLoading) {
		return (
			<div className="bg-gray-50 flex items-center justify-center h-full">
				<p>Loading asset...</p>
			</div>
		);
	}

	if (isError || !asset) {
		return (
			<div className="bg-gray-50 flex items-center justify-center h-full">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Asset Not Found
					</h1>
					<p className="text-gray-600 mb-4">
						The asset you're looking for doesn't exist or could not be loaded.
					</p>
					<Link
						to="/assets/my-assets"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Assets
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center gap-4">
							<Link
								to="/assets/my-assets"
								className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
								Back to Assets
							</Link>
						</div>
						<div className="flex items-center gap-2">
							{(() => {
								const getStatusColor = (status: string) => {
									switch (status) {
										case "available":
											return "bg-green-100 text-green-800";
										case "borrowed":
											return "bg-yellow-100 text-yellow-800";
										case "in_repair":
											return "bg-yellow-100 text-yellow-800";
										case "unlisted":
											return "bg-gray-100 text-gray-800";
										default:
											return "bg-gray-100 text-gray-800";
									}
								};

								const formattedStatus = asset.status
									.split("_")
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(" ");

								return (
									<span
										className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}
									>
										<CheckCircle className="w-4 h-4" />
										{formattedStatus}
									</span>
								);
							})()}
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Image Gallery */}
					<div className="space-y-4">
						<div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200">
							{asset.images && asset.images.length > 0 ? (
								<img
									src={asset.images[0]}
									alt={asset.itemName}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">
									<Camera className="w-16 h-16" />
								</div>
							)}
						</div>

						{/* Additional Images */}
						{asset.images && asset.images.length > 1 && (
							<div className="grid grid-cols-4 gap-2">
								{asset.images.slice(1, 5).map((image) => (
									<div
										key={image}
										className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200"
									>
										<img
											src={image}
											alt={`${asset.itemName}`}
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Asset Details */}
					<div className="space-y-6">
						{/* Title and Brand */}
						<div>
							<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
								<Tag className="w-4 h-4" />
								{asset.category}
							</div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{asset.itemName}
							</h1>
							{asset.brandName && (
								<p className="text-xl text-gray-600">{asset.brandName}</p>
							)}
						</div>

						{/* Key Information */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
								<div className="flex items-center gap-2 text-gray-600 mb-1">
									<DollarSign className="w-4 h-4" />
									<span className="text-sm font-medium">Purchase Cost</span>
								</div>
								<p className="text-2xl font-bold text-gray-900">
									{formatCurrency(asset.purchaseCost)}
								</p>
							</div>

							<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
								<div className="flex items-center gap-2 text-gray-600 mb-1">
									<Calendar className="w-4 h-4" />
									<span className="text-sm font-medium">Purchase Date</span>
								</div>
								<p className="text-lg font-semibold text-gray-900">
									{formatDate(asset.purchaseDate)}
								</p>
							</div>
						</div>

						{/* Location */}
						<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
							<div className="flex items-center gap-2 text-gray-600 mb-1">
								<MapPin className="w-4 h-4" />
								<span className="text-sm font-medium">Current Location</span>
							</div>
							<p className="text-lg font-semibold text-gray-900">
								{asset.currentLocation}
							</p>
						</div>

						{/* Condition Description */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<h3 className="text-lg font-semibold text-gray-900 mb-3">
								Condition Description
							</h3>
							<p className="text-gray-700 leading-relaxed">
								{asset.conditionDescription}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Maintenance Section */}
			<div className="bg-gray-100 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-0">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
						<h2 className="text-2xl font-bold text-primary-gray">
							Maintenance History
						</h2>
						<Button
							onClick={() => setAddModalOpen(true)}
							className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
						>
							Add Maintenance
						</Button>
					</div>

					<div className="space-y-4">
						{isLoadingMaintenance ? (
							<div className="text-center text-primary-gray">
								Loading maintenance tasks...
							</div>
						) : maintenanceItemsWithStatus.length === 0 ? (
							<div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
								<p className="text-lg">
									No maintenance history for this asset.
								</p>
							</div>
						) : (
							maintenanceItemsWithStatus.map((maintenance) => (
								<MaintenanceCard
									key={maintenance.id}
									task={maintenance}
									imageUrl={asset.images?.[0] || "/placeholder.jpg"}
									onUpdateStatus={handleUpdateStatus}
									onViewDetails={handleViewDetails}
								/>
							))
						)}
					</div>
				</div>
			</div>

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
