import { create } from 'zustand'
import { ReactNode } from 'react'

interface DrawerState {
  isOpen: boolean
  content: ReactNode | null
  title: string | null
  onClose?: () => void
  open: (options: { content: ReactNode; title: string; onClose?: () => void }) => void
  close: () => void
}

export const useDrawer = create<DrawerState>((set, get) => ({
  isOpen: false,
  content: null,
  title: null,
  onClose: undefined,
  open: ({ content, title, onClose }) => set({ isOpen: true, content, title, onClose }),
  close: () => {
    const { onClose } = get()
    if (onClose) onClose()
    set({ isOpen: false, content: null, title: null, onClose: undefined })
  }
})) 