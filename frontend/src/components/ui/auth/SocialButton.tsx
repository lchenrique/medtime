import { Button } from "@/components/ui/button"
import { ComponentProps } from "react"

interface SocialButtonProps extends ComponentProps<typeof Button> {
  icon: React.ReactNode
  label: string
}

export function SocialButton({ icon, label, ...props }: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
      {...props}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Button>
  )
} 