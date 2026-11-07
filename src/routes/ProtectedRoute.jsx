import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'

export const ProtectedRoute = ({ allowedRoles = Object.values(ROLES), children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>403 Forbidden</div>
  }

  return children || <Outlet />
}

export default ProtectedRoute
