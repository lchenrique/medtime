import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { Login } from '@/pages/Login'
import { Home } from '@/pages/Home'
import { Settings } from '@/pages/Settings'
import { Layout } from '@/components/Layout'
import { Register } from './pages/Register'
import { AuthLayout } from './components/layouts/AuthLayout'
import { Toaster } from 'react-hot-toast'
import { NotificationManager } from '@/components/NotificationManager'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Medications } from '@/pages/Medications'
import { Health } from '@/pages/Health'

export default function App() {
  const { user } = useUserStore()

  useWebSocket()

  return (
    <BrowserRouter>
     
      <Routes>
        <Route element={!user ? <AuthLayout /> : <Navigate to="/" />}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        </Route>
        
        {/* Rotas protegidas */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/health" element={<Health />} />
        </Route>
      </Routes>

      <NotificationManager />
      <Toaster position="top-right" />
    </BrowserRouter>

  )
}
