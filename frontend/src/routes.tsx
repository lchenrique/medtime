import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Settings } from '@/pages/Settings'
import { Layout } from '@/components/Layout'
import { AuthGuard } from '@/components/AuthGuard'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Health } from '@/pages/Health'
import { Medications } from '@/pages/Medications'
import { AlarmWrapper } from '@/components/AlarmWrapper'
import { Suspense } from 'react'
import { Loading } from '@/components/Loading'
import { Root } from '@/components/Root'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { Modal } from '@/components/ui/modal/Modal'

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Rotas públicas (sem autenticação)
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />
          },
          {
            path: 'register',
            element: <Register />
          },
          {
            path: 'auth/callback',
            element: <AuthCallback />
          }
        ]
      },
      // Rotas protegidas (com autenticação)
      {
        path: '/',
        element: (
          <>
            <AuthGuard><Layout /></AuthGuard>
          </>
        ),
        children: [
          {
            path: '/',
            element: <Home />
          },
          {
            path: '/medications',
            element: <Medications />
          },
          {
            path: '/settings',
            element: <Settings />
          },
          {
            path: '/health',
            element: <Health />
          },
          {
            path: '/alarm/:medicationId',
            element: (
              <Suspense fallback={<Loading />}>
                <AlarmWrapper />
              </Suspense>
            )
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />
      }
    ]
  }
]) 