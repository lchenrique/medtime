import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { MedTimeIcon } from './icons/MedTimeIcon'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link 
      to="/" 
      className={cn("flex items-center gap-2", className)}
    >
      <MedTimeIcon className="w-10 h-10" />
      {showText && (
        <span className="font-bold text-primary text-2xl">
          MedTime
        </span>
      )}
    </Link>
  )
} 