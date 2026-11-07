import { Link, useLocation } from 'react-router-dom'
import {
  RiPulseLine as Activity,
  RiSoundModuleLine as AudioLines,
  RiCalendarLine as CalendarDays,
  RiHeadphoneLine as Headphones,
  RiDashboardLine as LayoutDashboard,
  RiChat1Line as MessageSquareText,
  RiSettings3Line as Settings2,
  RiGroupLine as UsersRound,
  RiBuildingLine as Building2,
  RiTimeLine as Clock3
} from '@remixicon/react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'

const navItems = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Businesses', path: '/businesses', icon: Building2, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN] },
  { label: 'Staff', path: '/staff', icon: UsersRound, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN, ROLES.STAFF] },
  { label: 'Services', path: '/services', icon: AudioLines, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN, ROLES.STAFF] },
  { label: 'Appointments', path: '/appointments', icon: CalendarDays, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN, ROLES.STAFF] },
  { label: 'Customers', path: '/customers', icon: UsersRound, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN, ROLES.STAFF] },
  { label: 'Conversations', path: '/conversations', icon: MessageSquareText, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN] },
  { label: 'Availability', path: '/availability', icon: Clock3, role: [ROLES.SUPERADMIN, ROLES.BUSINESS_ADMIN, ROLES.STAFF] },
  { label: 'Platform settings', path: '/admin', icon: Settings2, role: [ROLES.SUPERADMIN] }
]

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const items = navItems.filter((item) => !item.role || item.role.includes(user?.role))

  return (
    <aside className="app-sidebar">
      <Link aria-label="AVR Frontdesk home" className="sidebar-brand" to="/">
        <span className="brand-icon"><Headphones size={19} /></span>
        <span className="brand-wordmark">AVR<span> / FRONTDESK</span></span>
      </Link>

      <div className="sidebar-workspace">
        <span className="workspace-avatar"><Activity size={17} /></span>
        <span><strong>AVR Platform</strong><small>Enterprise workspace</small></span>
        <span className="workspace-chevron" aria-hidden="true">⌄</span>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {items.map(({ label, path, icon: Icon }) => {
          const active = path === '/'
            ? location.pathname === '/'
            : location.pathname === path || location.pathname.startsWith(`${path}/`)
          return (
            <Link aria-label={label} aria-current={active ? 'page' : undefined} className={`sidebar-link${active ? ' is-active' : ''}`} key={label} title={label} to={path}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Businesses' && user?.role === ROLES.SUPERADMIN && <span className="sidebar-new-dot" />}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-security">
          <span className="security-icon"><Activity size={16} /></span>
          <span><strong>All systems operational</strong><small>Platform status</small></span>
          <span className="online-dot" />
        </div>
        <div className="sidebar-user">
          <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          <span className="sidebar-user-copy"><strong>{user?.name || 'Workspace user'}</strong><small>{user?.role?.replace('_', ' ') || 'Account'}</small></span>
          <button aria-label="Sign out" className="sidebar-logout" onClick={logout} title="Sign out" type="button">↗</button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
