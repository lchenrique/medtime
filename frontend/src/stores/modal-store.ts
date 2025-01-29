import { create } from 'zustand'

interface ModalStore {
  isOpen: boolean
  content: React.ReactNode | null
  title: string | null
  open: (options: { title: string; content: React.ReactNode }) => void
  close: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  content: null,
  title: null,
  open: ({ title, content }) => set({ isOpen: true, content, title }),
  close: () => set({ isOpen: false, content: null, title: null }),
})) 