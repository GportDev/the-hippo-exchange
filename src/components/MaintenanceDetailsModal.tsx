import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Maintenance } from "@/lib/Types";
import { Edit, Trash2, X } from "lucide-react";

type MaintenanceStatus = "overdue" | "pending" | "completed";

interface MaintenanceDetailsModalProps {
	task: (Maintenance & { status: MaintenanceStatus }) | null;
	onClose: () => void;
	onEdit: (task: Maintenance & { status: MaintenanceStatus }) => void;
	onDelete: (taskId: string) => void;
	onUpdateStatus?: (maintenanceId: string, isCompleted: boolean) => void;
}

const formatDate = (dateString: string) => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export function MaintenanceDetailsModal({
	task,
	onClose,
	onEdit,
	onDelete,
	onUpdateStatus,
}: MaintenanceDetailsModalProps) {
	if (!task) return null;

	const recurrenceUnitString = task.recurrenceUnit || "";

	const handleDelete = () => {
		if (
			task.id &&
			window.confirm(
				"Are you sure you want to delete this maintenance record? This action cannot be undone.",
			)
		) {
			onDelete(task.id);
		}
	};

	return (
		<Dialog open={!!task} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="w-[90vw] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col p-0">
				<DialogClose asChild>
					<button
						type="button"
						aria-label="Close"
						className="absolute right-4 top-4 text-primary-yellow hover:text-white transition-colors z-10"
						onClick={onClose}
					>
						<X className="h-5 w-5" />
					</button>
				</DialogClose>
				<DialogHeader className="-m-[1px] bg-primary-gray text-white px-6 py-4 rounded-t-lg">
					<DialogTitle className="text-center text-primary-yellow text-2xl">
						{task.maintenanceTitle}
					</DialogTitle>
					<DialogDescription className="text-white/80 text-center">
						Maintenance Details
					</DialogDescription>
				</DialogHeader>

				<div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 text-sm">
					{/* General Info */}
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
							Task Info
						</h3>
						<div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 items-center">
							<strong className="text-gray-500">Status:</strong>
							<span className="capitalize font-medium">{task.status}</span>

							<strong className="text-gray-500">Due Date:</strong>
							<span>{formatDate(task.maintenanceDueDate)}</span>

							<strong className="text-gray-500">Cost:</strong>
							<span>{`$${task.costPaid.toFixed(2)}`}</span>
						</div>
					</div>

					{/* Asset & Tools Info */}
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
							Asset & Tools
						</h3>
						<div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 items-center">
							<strong className="text-gray-500">Product:</strong>
							<span>{task.productName}</span>

							<strong className="text-gray-500">Brand:</strong>
							<span>{task.brandName}</span>

							<strong className="text-gray-500">Tool Location:</strong>
							<span>{task.toolLocation || "N/A"}</span>
						</div>
					</div>

					{task.maintenanceDescription && (
						<div>
							<strong className="text-gray-500 mb-1 block">Description:</strong>
							<p className="bg-gray-50 p-3 rounded-md border text-gray-800">
								{task.maintenanceDescription}
							</p>
						</div>
					)}

					{task.requiredTools && task.requiredTools.length > 0 && (
						<div>
							<strong className="text-gray-500 mb-1 block">
								Required Tools:
							</strong>
							<ul className="list-disc list-inside bg-gray-50 p-3 rounded-md border text-gray-800">
								{task.requiredTools.map((tool: string) => (
									<li key={tool}>{tool}</li>
								))}
							</ul>
						</div>
					)}

					{task.preserveFromPrior &&
						task.recurrenceInterval &&
						recurrenceUnitString && (
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-primary-gray border-b pb-1 mb-3">
									Recurrence
								</h3>
								<p className="bg-gray-50 p-3 rounded-md border text-gray-800">{`Repeats every ${task.recurrenceInterval} ${recurrenceUnitString}`}</p>
							</div>
						)}
				</div>

				<DialogFooter className="flex-shrink-0 border-t px-6 py-4 flex flex-col sm:flex-row justify-between w-full gap-3">
					<Button
						onClick={handleDelete}
						className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-600/10 text-red-700 border border-red-600/20 hover:bg-red-600/20 hover:border-red-600/30 transition-colors"
					>
						<Trash2 className="h-4 w-4" />
						Delete
					</Button>
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						{onUpdateStatus && !task.isCompleted && task?.id && (
							<Button
								type="button"
								onClick={() => {
									if (task.id) {
										onUpdateStatus(task.id, true);
									}
								}}
								className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors flex items-center justify-center gap-2"
							>
								<span className="text-lg">✓</span>
								Mark Complete
							</Button>
						)}
						{onUpdateStatus && task.isCompleted && task?.id && (
							<Button
								type="button"
								onClick={() => {
									if (task.id) {
										onUpdateStatus(task.id, false);
									}
								}}
								className="w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors flex items-center justify-center gap-2"
							>
								<span className="text-lg">↺</span>
								Undo Complete
							</Button>
						)}
						<Button
							onClick={() => onEdit(task)}
							className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary-gray text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors"
						>
							<Edit className="h-4 w-4" />
							Edit
						</Button>
						<DialogClose asChild>
							<Button
								onClick={onClose}
								className="w-full sm:w-auto bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300 transition-colors"
							>
								Close
							</Button>
						</DialogClose>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
