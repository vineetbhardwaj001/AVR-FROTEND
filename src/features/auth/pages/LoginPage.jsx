import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  RiArrowRightLine as ArrowRight,
  RiHeadphoneLine as Headphones,
  RiLockLine as LockKeyhole,
  RiMailLine as Mail,
  RiShieldCheckLine as ShieldCheck
} from '@remixicon/react'
import { authService } from '@/features/auth/services/authService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import './LoginPage.css'

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await authService.login({ email: email.trim(), password })
      const result = data?.data
      if (!result?.token || !result?.user) {
        throw new Error('The server returned an invalid sign-in response.')
      }

      login(result.token, result.user)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        'Unable to sign in. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <span className="login-brand-mark"><Headphones size={20} /></span>
          <span>AVR<span className="login-brand-light">. FRONTDESK</span></span>
        </div>

        <div className="login-story-content">
          <span className="login-eyebrow"><span /> ENTERPRISE VOICE PLATFORM</span>
          <h1>Every conversation,<br />handled with care.</h1>
          <p>One calm, intelligent front desk for every business you serve.</p>
          <div className="login-story-foot">
            <ShieldCheck size={17} />
            <span>Secure access · Tenant-aware by design</span>
          </div>
        </div>
        <div className="login-story-orb login-story-orb-one" />
        <div className="login-story-orb login-story-orb-two" />
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="login-form-kicker">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className="login-form-intro">Enter your account credentials to continue.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Work email</label>
            <div className="login-input-wrap">
              <Mail size={18} />
              <input
                autoComplete="username"
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
            </div>

            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <LockKeyhole size={18} />
              <input
                autoComplete="current-password"
                id="login-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button className="login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>
          <div className="login-support">
            <span>Need help accessing your account?</span>
            <a href="mailto:support@avr.frontdesk">Contact support</a>
          </div>
        </div>
        <footer className="login-footer">© {new Date().getFullYear()} AVR Frontdesk. All rights reserved.</footer>
      </section>
    </main>
  )
}

export default LoginPage
