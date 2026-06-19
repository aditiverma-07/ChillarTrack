import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PublicLayout() {
  const { isAuthenticated } = useAuth()

  // Redirect authenticated users away from auth pages
  // But allow landing page for everyone
  return <Outlet />
}
