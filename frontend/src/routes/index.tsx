import { Health } from '@/pages/Health'
import { PrivateRoute } from '@/components/PrivateRoute'

export const routes = [
  {
    path: '/health',
    element: (
      <PrivateRoute>
        <Health />
      </PrivateRoute>
    )
  }
] 