import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/maintenance/')({
  component: RouteComponent,
})

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

function RouteComponent() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'upcoming' | 'history'>('all')

  const filteredItems = maintenanceData.filter(item => {
    switch (activeFilter) {
      case 'overdue':
        return item.status === 'overdue'
      case 'upcoming':
        return item.status === 'upcoming'
      case 'history':
        return item.status === 'completed'
      default:
        return true
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50'
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
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
    <div className='bg-gray-50 p-6'>
      <section className='mx-auto max-w-7xl'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-primary-gray'>My Maintenance</h1>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-6 border-b border-gray-200 mb-6'>
          {[
            { key: 'all', label: 'All' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'history', label: 'History' }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key as 'all' | 'overdue' | 'upcoming' | 'history')}
              className={`pb-2 px-1 font-semibold text-lg border-b-2 transition-colors cursor-pointer ${
                activeFilter === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Maintenance Items List */}
        <div className='space-y-4'>
          {filteredItems.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <p className='text-lg'>No maintenance items found for this filter.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='text-xl font-semibold text-primary-gray'>{item.itemName}</h3>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    </div>
                    <p className='text-gray-600 mb-2'>{item.action}</p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span>Due: {formatDate(item.dueDate)}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <button type="button" className='px-4 py-2 bg-primary-gray text-primary-yellow rounded-md hover:bg-primary-gray/90 hover:text-primary-yellow/90 transition-colors cursor-pointer'>
                      {item.status === 'completed' ? 'View Details' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}