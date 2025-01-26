import { useUserStore } from '@/stores/user'
import { Avatar as AvatarRoot, AvatarFallback } from '@/components/ui/avatar'

export function Avatar() {
  const { user } = useUserStore()

  if (!user) return null

  return (
    <AvatarRoot>
      <AvatarFallback className="bg-primary/10 text-primary">
        {user?.name[0].toUpperCase()}
      </AvatarFallback>
    </AvatarRoot>
  )
} 