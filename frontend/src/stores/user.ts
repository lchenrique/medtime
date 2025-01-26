import { create } from 'zustand'
import type { GetAuthProfile200 } from '@/api/model'
import { patchAuthProfile } from '@/api/generated/auth/auth'
import { storage } from '@/lib/storage'

interface UserState {
  user: GetAuthProfile200 | null
  setUser: (user: GetAuthProfile200 | null) => void
  updateUser: (data: Partial<GetAuthProfile200>) => Promise<void>
  logout: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: async (data) => {
    try {
      await patchAuthProfile(data)
      const currentUser = get().user
      if (currentUser) {
        set({ user: { ...currentUser, ...data } })
      }
    } catch (error) {
      throw error
    }
  },
  logout: async () => {
    await storage.remove('token')
    set({ user: null })
  }
})) 