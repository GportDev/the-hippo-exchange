//import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

interface ShortMaintenance {
  id: string;
  productName: string;
  maintenanceStatus: string;
  maintenanceDueDate: string;
  maintenanceTitle: string;
}

interface MaintenaceCardProps {
  maintenance: ShortMaintenance;
  onToggleComplete: (id:string, newStatus: string) => void;
}


export function MaintenaceCard({ maintenance, onToggleComplete}: MaintenaceCardProps) {
  const getStatusColor = () => {
    switch (maintenance.maintenanceStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
  <div
   className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
 >
   <div className='flex justify-between items-start'>
     <div className='flex-1'>
       <div className='flex items-center gap-3 mb-2'>
         <h3 className='text-xl font-semibold text-primary-gray'>{maintenance.productName}</h3>
         <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          <Badge className={getStatusColor()}>
            {maintenance.maintenanceStatus === "pending"
              ? "Upcoming"
              : maintenance.maintenanceStatus.charAt(0).toUpperCase() + maintenance.maintenanceStatus.slice(1)}
          </Badge>
         </span>
       </div>
       <p className='text-gray-600 mb-2'>{maintenance.maintenanceTitle}</p>
       <div className='flex items-center gap-4 text-sm text-gray-500'>
         <span>Due: {formatDate(maintenance.maintenanceDueDate)}</span>
         {/*<span>•</span>
         <span>{maintenance.Category}</span> no category in backend*/}
       </div>
     </div>
     <div className='ml-4 grid space-y-4'>
       <button onClick={() => onToggleComplete(maintenance.id, maintenance.maintenanceStatus === "completed" ? "pending" : "completed")} type="button" 
       className='px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer'>
         {maintenance.maintenanceStatus === 'completed' ? 'Completed' : 'Mark Complete'}
       </button>
       <button type="button" className='px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer'>
         View Details
       </button>
     </div>
   </div>
 </div>         
  );
}