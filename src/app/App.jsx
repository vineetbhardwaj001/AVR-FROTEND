import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/layouts/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { DashboardPage } from '@/pages/DashboardPage'
import { BusinessesPage } from '@/pages/BusinessesPage'
import { StaffPage } from '@/pages/StaffPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { ConversationsPage } from '@/pages/ConversationsPage'
import { AvailabilityPage } from '@/pages/AvailabilityPage'

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="admin/*" element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
          <Route index element={<Navigate to="/businesses" replace />} />
        </Route>
        <Route path="businesses" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'BUSINESS_ADMIN']}><BusinessesPage /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="conversations" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'BUSINESS_ADMIN']}><ConversationsPage /></ProtectedRoute>} />
        <Route path="availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
