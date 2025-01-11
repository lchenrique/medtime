import { User } from '@/types/user'
import { useUserStore } from '@/stores/user'
import { Avatar as AvatarRoot, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function Avatar() {
  const { user } = useUserStore()

  if (!user) return null

  return (
    <AvatarRoot>
      {user.avatar ? (
        <AvatarImage src={user.avatar} alt={user.name} />
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary">
          {user.name[0].toUpperCase()}
        </AvatarFallback>
      )}
    </AvatarRoot>
  )
} 