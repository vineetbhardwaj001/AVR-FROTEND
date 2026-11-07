import {
  RiNotificationLine as Bell,
  RiArrowRightSLine as ChevronRight,
  RiQuestionLine as CircleHelp
} from '@remixicon/react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

const routeTitles = {
  '/': 'Overview',
  '/businesses': 'Businesses',
  '/staff': 'Staff',
  '/services': 'Services',
  '/appointments': 'Appointments',
  '/customers': 'Customers',
  '/conversations': 'Conversations',
  '/availability': 'Availability',
  '/admin': 'Platform settings'
}

export const Topbar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'Workspace'

  return (
    <header className="app-topbar">
      <div className="topbar-crumbs">
        <span>AVR Platform</span>
        <ChevronRight size={15} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <span className="topbar-date">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
        <button aria-label="Help and support" className="topbar-icon-button" type="button"><CircleHelp size={18} /></button>
        <button aria-label="Notifications" className="topbar-icon-button notification-button" type="button"><Bell size={18} /><span /></button>
        <span className="topbar-divider" />
        <div className="topbar-identity">
          <span className="user-avatar topbar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          <span><strong>{user?.name || 'Workspace user'}</strong><small>{user?.role?.replace('_', ' ') || 'Account'}</small></span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
