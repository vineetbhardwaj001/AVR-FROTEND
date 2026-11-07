import {
  RiArrowRightLine as ArrowRight,
  RiBuildingLine as Building2,
  RiSoundModuleLine as AudioLines,
  RiShieldCheckLine as ShieldCheck,
  RiSparkling2Line as Sparkles
} from '@remixicon/react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'

export const DashboardPage = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === ROLES.SUPERADMIN

  return (
    <div className="dashboard-page">
      <div className="businesses-breadcrumb">
        <span>Workspace</span><span className="breadcrumb-divider">/</span><strong>Overview</strong>
      </div>
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="businesses-eyebrow"><span className="eyebrow-dot" /> YOUR OPERATIONS, AT A GLANCE</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}.</h1>
          <p>
            {isSuperAdmin
              ? 'Keep every business workspace connected, supported, and ready for its next conversation.'
              : 'Your workspace is ready. Manage your team and deliver a great experience to every caller.'}
          </p>
          <Link className="primary-button dashboard-action" to={isSuperAdmin ? '/businesses' : '/appointments'}>
            {isSuperAdmin ? <><Building2 size={17} /> Manage businesses</> : <>View appointments <ArrowRight size={17} /></>}
          </Link>
        </div>
        <div className="dashboard-illustration" aria-hidden="true">
          <span className="illustration-glow" />
          <span className="illustration-ring illustration-ring-one" />
          <span className="illustration-ring illustration-ring-two" />
          <span className="illustration-icon"><AudioLines size={47} strokeWidth={1.4} /></span>
          <span className="illustration-sparkle"><Sparkles size={17} /></span>
        </div>
      </section>

      <section className="dashboard-info-grid">
        <article className="dashboard-info-card">
          <span className="info-card-icon info-icon-blue"><ShieldCheck size={19} /></span>
          <div><h2>Secure by default</h2><p>Role-based access and tenant isolation help keep each business workspace private.</p></div>
          <span className="info-card-foot"><span className="online-dot" /> Access controls active</span>
        </article>
        <article className="dashboard-info-card">
          <span className="info-card-icon info-icon-lime"><Building2 size={19} /></span>
          <div><h2>{isSuperAdmin ? 'Grow your platform' : 'Your business workspace'}</h2><p>
            {isSuperAdmin
              ? 'Onboard a business and provision its business admin account in one guided flow.'
              : 'Your business admin can manage staff, services, and day-to-day operations.'}
          </p></div>
          <Link className="info-card-link" to={isSuperAdmin ? '/businesses' : '/staff'}>
            {isSuperAdmin ? 'Start onboarding' : 'Manage your team'} <ArrowRight size={15} />
          </Link>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage
