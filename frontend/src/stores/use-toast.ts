
import { create } from 'zustand'

type Toast = {
  id: string
  title: string
  description?: string
  duration?: number
  type?: 'default' | 'success' | 'error' | 'warning'
}

type ToastStore = {
  toasts: Toast[]
  open: (toast: Omit<Toast, 'id'>) => void
  close: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  open: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substring(2, 9), duration: toast.duration ?? 2000 },
      ],
    })),
  close: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
