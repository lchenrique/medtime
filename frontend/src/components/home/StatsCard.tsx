import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: ReactNode
  mobileTitle: string
  value: number
  label: ReactNode
  mobileLabel: string
  icon: ReactNode
  variant?: 'default' | 'alert'
  className?: string
}

export function StatsCard({
  title,
  mobileTitle,
  value,
  label,
  mobileLabel,
  icon,
  variant = 'default',
  className
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white/15 backdrop-blur-sm rounded-2xl p-3 sm:p-4",
      className
    )}>
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div className={cn(
          "p-1.5 sm:p-2 rounded-lg",
          variant === 'alert' ? "bg-red-500/30" : "bg-white/20"
        )}>
          {icon}
        </div>
        <p className="text-xs sm:text-sm text-white/90">
          <span className="sm:hidden">{mobileTitle}</span>
          <span className="hidden sm:inline">{title}</span>
        </p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-lg sm:text-2xl font-bold text-white">
          {value}
        </p>
        <span className="text-xs sm:text-sm font-normal text-white/80">
          <span className="sm:hidden">{mobileLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
      </div>
    </div>
  )
}
