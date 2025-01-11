import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Settings } from '@/pages/Settings'
import { Layout } from '@/components/Layout'
import { AuthGuard } from '@/components/AuthGuard'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AuthLayout } from '@/components/layouts/AuthLayout'

// Rotas públicas (sem autenticação)
const publicRoutes = [
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
      }
    ]
  }
]

// Rotas protegidas (com autenticação)
const protectedRoutes = [
  {
    path: '/',
    element: <AuthGuard><Layout /></AuthGuard>,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/settings',
        element: <Settings />
      }
    ]
  }
]

export const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]) 