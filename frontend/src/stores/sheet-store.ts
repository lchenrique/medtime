import { create } from 'zustand'

interface SheetOptions {
  title?: string
  content: React.ReactNode
  snapPoints?: (string | number)[]
  defaultSnapPoint?: string | number
}

interface SheetStore {
  isOpen: boolean
  options: SheetOptions | null
  snap: number | string | null
  open: (options: SheetOptions) => void
  close: () => void
  setSnap: (snap: number | string | null) => void
}

export const useSheetStore = create<SheetStore>((set) => ({
  isOpen: false,
  options: null,
  snap: null,
  open: (newOptions) => set({ 
    isOpen: true, 
    options: newOptions,
    snap: newOptions.snapPoints?.[0] ?? null 
  }),
  close: () => {
    set({ isOpen: false })
    // Limpa as opções após a animação de fechamento
    setTimeout(() => {
      set({ options: null, snap: null })
    }, 300)
  },
  setSnap: (snap) => set({ snap })
})) 