import { HomeSkeleton } from "@/components/HomeSkeleton";
import type { Asset, Maintenance } from "@/lib/Types";
import { apiFetch } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	Calendar,
	ChevronRight,
	DollarSign,
	Heart,
	Package,
	X,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/home/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user, isLoaded, isSignedIn } = useUser();

	const greeting = useMemo(() => {
		const greetings = ["Hello", "Welcome back", "Hi there", "Hey", "Greetings"];
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
		useQuery<(Maintenance & { status: "overdue" | "pending" | "completed" })[]>(
			{
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
			},
		);

	// Derived State
	const isLoading = assetsLoading || maintenanceLoading;
	const pendingItems = maintenanceTasks.filter(
		(item) => item.status === "pending",
	);
	const overdueItems = maintenanceTasks.filter(
		(item) => item.status === "overdue",
	);
	const upcomingItems = useMemo(() => {
		return maintenanceTasks
			.filter((item) => item.status === "pending" || item.status === "overdue")
			.sort(
				(a, b) =>
					new Date(a.maintenanceDueDate).getTime() -
					new Date(b.maintenanceDueDate).getTime(),
			);
	}, [maintenanceTasks]);

	const favoriteAssets = assets.filter((asset) => asset.favorite);
	const totalAssetValue = assets.reduce(
		(sum, asset) => sum + (asset.purchaseCost || 0),
		0,
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
					duration: Number.POSITIVE_INFINITY,
					style: {
						background: "#FFFBEB", // bg-yellow-50
						border: "1px solid #FBBF24", // border-yellow-400
					},
				},
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
		<div className="h-full bg-gradient-to-br from-gray-50 to-gray-100/50">
			<main className="p-4 sm:p-6 space-y-4">
				<div className="mx-auto max-w-7xl">
					{/* Header Section */}
					<div className="mb-5">
						<h1 className="text-3xl sm:text-4xl font-bold text-primary-gray mb-1">
							{greeting}, {user?.firstName}
						</h1>
						<p className="text-base text-gray-600">
							Here's what's happening with your assets today.
						</p>
					</div>

					{/* Stats Cards - Compressed Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
						<Link
							to="/assets/my-assets"
							className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						>
							<div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
							<Package className="h-7 w-7 text-blue-600 mb-2" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">Total Assets</div>
							<div className="text-2xl font-bold text-primary-gray">{assets.length}</div>
						</Link>

						<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
							<div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10" />
							<DollarSign className="h-7 w-7 text-green-600 mb-2" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">Total Value</div>
							<div className="text-2xl font-bold text-primary-gray">
								${totalAssetValue.toLocaleString()}
							</div>
						</div>

						<Link
							to="/maintenance"
							search={{ filter: "pending" }}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						>
							<div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
							<Calendar className="h-7 w-7 text-yellow-600 mb-2" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">Upcoming</div>
							<div className="text-2xl font-bold text-primary-gray">{pendingItems.length}</div>
						</Link>

						<Link
							to="/maintenance"
							search={{ filter: "overdue" }}
							className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						>
							<div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
							<AlertTriangle className="h-7 w-7 text-red-600 mb-2" />
							<div className="text-xs font-medium text-gray-600 mb-0.5">Overdue</div>
							<div className="text-2xl font-bold text-primary-gray">{overdueItems.length}</div>
						</Link>
					</div>
					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						{/* Upcoming Maintenance Section */}
						<div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50/50 p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-primary-gray">
									Upcoming Maintenance
								</h2>
								<Link
									to="/maintenance"
									search={{ filter: "all" }}
									className="text-sm font-medium text-gray-500 hover:text-primary-gray transition-colors flex items-center gap-1"
								>
									View All
									<ChevronRight className="h-4 w-4" />
								</Link>
							</div>
							<div className="overflow-y-auto max-h-[400px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
								{isLoading ? (
									<p className="text-gray-500 py-6 text-center">
										Loading maintenance items...
									</p>
								) : upcomingItems.length > 0 ? (
									upcomingItems.map((item) => (
										<Link
											to="/assets/my-assets/$id"
											params={{ id: item.assetId }}
											key={item.id}
											className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-300 hover:shadow-sm"
										>
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<div
													className={`p-2 rounded-lg ${getStatusClasses(
														item.status,
													)} group-hover:scale-110 transition-transform duration-200`}
												>
													<Calendar className="h-4 w-4" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate text-sm">
														{item.maintenanceTitle}
													</p>
													<p className="text-xs text-gray-600 truncate">
														{item.brandName} {item.productName}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2 ml-3">
												<span
													className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getStatusClasses(
														item.status,
													)}`}
												>
													{new Date(
														item.maintenanceDueDate,
													).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
												</span>
												<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
											</div>
										</Link>
									))
								) : (
									<div className="py-8 text-center">
										<Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
										<p className="text-gray-500 font-medium text-sm">
											No upcoming maintenance items.
										</p>
										<p className="text-xs text-gray-400 mt-1">
											Your assets are all up to date!
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Favorite Assets Section */}
						<div className="bg-gradient-to-br from-white to-gray-50/50 p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-primary-gray">
									Favorite Assets
								</h2>
								<Link
									to="/assets/my-assets"
									className="text-sm font-medium text-gray-500 hover:text-primary-gray transition-colors flex items-center gap-1"
								>
									View All
									<ChevronRight className="h-4 w-4" />
								</Link>
							</div>
							<div className="overflow-y-auto max-h-[400px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
								{isLoading ? (
									<p className="text-gray-500 py-6 text-center">Loading assets...</p>
								) : favoriteAssets.length > 0 ? (
									favoriteAssets.map((asset) => (
										<Link
											to="/assets/my-assets/$id"
											params={{ id: asset.id }}
											key={asset.id}
											className="group flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-300 hover:shadow-sm"
										>
											{asset.images && asset.images.length > 0 ? (
												<img
													src={asset.images[0]}
													alt={asset.itemName}
													className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
												/>
											) : (
												<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-sm">
													<Package className="h-6 w-6 text-gray-400" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<p className="font-semibold text-gray-900 truncate text-sm">
													{asset.itemName}
												</p>
												<p className="text-xs text-gray-500 truncate">
													{asset.brandName}
												</p>
											</div>
											<Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
										</Link>
									))
								) : (
									<div className="py-8 text-center">
										<Heart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
										<p className="text-gray-500 font-medium text-sm">
											No favorite assets yet
										</p>
										<p className="text-xs text-gray-400 mt-1">
											Click the heart on an asset to add it here
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
