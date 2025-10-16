import { MaintenanceCard } from "@/components/MaintenanceCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Maintenance } from "@/lib/Types";


interface MaintenanceCardWithImageProps {
  task: Maintenance;
  onUpdateStatus?: (maintenanceId: string, status: string) => void;
  onViewDetails: (task: Maintenance) => void;
  picture: string;
}

function useAssetImage(userId:string, assetId?: string) {
  return useQuery<string[]>({
    queryKey: ["assetImage", assetId],
    queryFn: async () => {
      if (!assetId) return "oops";
      const res = await apiFetch(userId, `/assets/${assetId}/images`);
      return res;
    },
    enabled: !!assetId,
  });
}

export function MaintenanceCardWithImage({
  task,
  onUpdateStatus,
  onViewDetails,
  userId,
}: MaintenanceCardWithImageProps) {
  const { data: imageUrl} = useAssetImage(userId, task.assetId);
  return (
    <MaintenanceCard
      key={task.id}
      task={task}
      onUpdateStatus={onUpdateStatus}
      onViewDetails={onViewDetails}
      picture={imageUrl?.[0] ?? '/public/placeholder.jpg'}
    />
  );
}
