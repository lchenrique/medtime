import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isFocused?: boolean
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, isFocused, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm',
          'hover:border-primary transition-colors',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          isFocused && 'border-primary ring-1 ring-primary',
          className
        )}
        {...props}
      />
    )
  }
) 