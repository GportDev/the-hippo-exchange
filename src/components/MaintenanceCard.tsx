import type React from 'react'

type MaintenanceCardProps = {
  date: string
  itemName: string
  action: string
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  date,
  itemName,
  action,
}) => {
  return (
      <div className="w-70 rounded-lg flex flex-col gap-0 justify-between text-slate-800 bg-primary-yellow/25">
        <h1 className='text-3xl font-semibold'>{date}</h1>
        <div className='inline'>
          <span className='text-xl inline'>{itemName} • </span>
          <p className='text-xl inline'>{action}</p>
        </div>
      </div>
  )
}

export default MaintenanceCard