import { Health } from '@/pages/Health'

      {
        path: '/health',
        element: (
          <PrivateRoute>
            <Health />
          </PrivateRoute>
        )
      }, 