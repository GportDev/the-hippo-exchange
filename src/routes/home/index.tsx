import { createFileRoute } from '@tanstack/react-router'


type MaintenanceItem = {
  id: string
  itemName: string
  action: string
  dueDate: string
  status: 'overdue' | 'upcoming' | 'completed'
  priority: 'high' | 'medium' | 'low'
  category: string
}

const maintenanceData: MaintenanceItem[] = [
  {
    id: '1',
    itemName: 'Predator 350 W Power Station',
    action: 'Recharge Station',
    dueDate: '2024-01-15',
    status: 'overdue',
    priority: 'high',
    category: 'Electronics'
  },
  {
    id: '2',
    itemName: 'Sony A7 III Camera Body',
    action: 'Clean sensor and check firmware',
    dueDate: '2024-01-20',
    status: 'upcoming',
    priority: 'medium',
    category: 'Electronics'
  },
  {
    id: '3',
    itemName: 'MacBook Pro 14-inch M3',
    action: 'Update software and clean keyboard',
    dueDate: '2024-01-25',
    status: 'upcoming',
    priority: 'high',
    category: 'Electronics'
  },
  {
    id: '4',
    itemName: 'Dyson V15 Detect Vacuum',
    action: 'Replace filter and clean brush',
    dueDate: '2024-01-10',
    status: 'completed',
    priority: 'medium',
    category: 'Home & Garden'
  },
  {
    id: '5',
    itemName: 'KitchenAid Stand Mixer',
    action: 'Lubricate gears and clean attachments',
    dueDate: '2024-01-30',
    status: 'upcoming',
    priority: 'low',
    category: 'Home & Garden'
  },
  {
    id: '6',
    itemName: 'Peloton Bike',
    action: 'Tighten bolts and clean bike',
    dueDate: '2024-01-05',
    status: 'completed',
    priority: 'medium',
    category: 'Sports & Fitness'
  }
]


export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

function RouteComponent() {

  const upcomingItems = maintenanceData.filter(item => item.status === 'upcoming' || item.status === 'overdue');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50'
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Home</h1>
      </div>
      <div >
        <h1 className='text-2xl'>Upcoming Maintenance</h1>
        {upcomingItems.length === 0 ? (
          <div className='py-12'>
            <h2>You have no upcoming maintenance!</h2>
          </div>
        ) : (
        <ul className="flex overflow-x-auto space-x-4 p-4">
  {upcomingItems.map((item) => (
    <li
      key={item.id}
      className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow w-80"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{item.itemName}</h3>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
            <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
            </span>
          </div>
          <p className="text-gray-600 mb-2">{item.action}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Due: {formatDate(item.dueDate)}</span>
            <span>•</span>
            <span>{item.category}</span>
          </div>
        </div>
      </div>
    </li>
  ))}
      </ul>
                    
      )}
      </div>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl'>Favorite Assets</h1>
      </div>
    </div>

  )
      

  
}

