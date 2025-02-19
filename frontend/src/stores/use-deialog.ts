import { create } from 'zustand'

interface DialogStore {
  isOpen: boolean
  content: React.ReactNode | null
  title: string | null
  open: (options: { title: string; content: React.ReactNode }) => void
  close: () => void
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  content: null,
  title: null,
  open: ({ title, content }) => set({ isOpen: true, content, title }),
  close: () => set({ isOpen: false, content: null, title: null }),
})) 