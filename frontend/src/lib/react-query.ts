import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false
    },
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
}) 