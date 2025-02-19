import { create } from 'zustand'
import type { GetAuthProfile200 } from '@/api/model'
import { patchAuthProfile } from '@/api/generated/auth/auth'
import { storage } from '@/lib/storage'

interface UserState {
  user: GetAuthProfile200 | null
  setUser: (user: GetAuthProfile200 | null) => void
  updateUser: (data: Partial<GetAuthProfile200>) => Promise<void>
  logout: () => Promise<void>
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
    try {
      // Tenta fazer logout no backend
      const token = await storage.get('token')
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

    } catch (error) {
      console.error('❌ Erro ao fazer logout no backend:', error)
    } finally {
      // Independente do resultado, limpa os dados locais
      await storage.remove('token')
      set({ user: null })
    }
  }
})) 