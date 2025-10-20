import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends PropsWithChildren {
  as?: keyof JSX.IntrinsicElements
  className?: string
  header?: ReactNode
}

export function PageContainer({
  as: Component = 'section',
  className,
  children,
  header,
}: PageContainerProps) {
  return (
    <Component className={cn('mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8', className)}>
      {header}
      {children}
    </Component>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-white/70 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
