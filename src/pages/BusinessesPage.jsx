import { useEffect, useState } from 'react'
import {
  RiArrowRightUpLine as ArrowUpRight,
  RiBuildingLine as Building2,
  RiCheckLine as Check,
  RiCheckboxCircleLine as CheckCircle2,
  RiQuestionLine as CircleHelp,
  RiMailLine as Mail,
  RiAddLine as Plus,
  RiSearchLine as Search,
  RiShieldCheckLine as ShieldCheck,
  RiUserLine as UserRound,
  RiCloseLine as X,
  RiEditLine as Edit,
  RiDeleteBinLine as Delete
} from '@remixicon/react'
import { businessService } from '@/lib/api'
import { useAuth } from '@/features/auth/hooks/useAuth'

const emptyForm = {
  name: '',
  industry: '',
  phone: '',
  email: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  confirmPassword: ''
}

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong. Please try again.'

const formatDate = (date) => {
  if (!date) return '—'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsedDate)
}

export const BusinessesPage = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const [businesses, setBusinesses] = useState([])
  const [businessProfile, setBusinessProfile] = useState(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdAccount, setCreatedAccount] = useState(null)
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [businessForm, setBusinessForm] = useState({})
  const [businessFormError, setBusinessFormError] = useState('')
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false)
  const [deletingBusinessId, setDeletingBusinessId] = useState(null)
  const [businessNotice, setBusinessNotice] = useState('')

  const loadBusinesses = async (requestedPage = page, name = appliedSearch) => {
    setIsLoading(true)
    setLoadError('')
    try {
      if (!isSuperAdmin) {
        if (!user?.businessId) {
          throw new Error('Your account is not associated with a business workspace.')
        }
        const { data } = await businessService.get(user.businessId)
        if (!data?.data) throw new Error('The server did not return your business profile.')
        setBusinessProfile(data.data)
        setBusinesses([data.data])
        setTotal(1)
        setTotalPages(1)
        return
      }

      const { data } = await businessService.list({
        page: requestedPage,
        limit: 10,
        ...(name ? { name } : {})
      })
      const responseData = data?.data
      const rows = Array.isArray(responseData) ? responseData : []
      setBusinesses(rows)
      setBusinessProfile(null)
      setTotal(Number(data?.meta?.total) || rows.length)
      setTotalPages(Math.max(1, Number(data?.meta?.totalPages) || 1))
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBusinesses(page, appliedSearch)
  }, [page, appliedSearch, isSuperAdmin, user?.businessId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setAppliedSearch(search.trim())
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (formError) setFormError('')
  }

  const closeOnboarding = () => {
    if (isSubmitting) return
    setIsOnboarding(false)
    setFormError('')
  }

  const handleOnboard = async (event) => {
    event.preventDefault()
    setFormError('')

    if (form.adminPassword !== form.confirmPassword) {
      setFormError('Passwords do not match. Please confirm the business admin password.')
      return
    }

    const openBusinessEditor = (business) => {
      setEditingBusiness(business)
      setBusinessForm({
        name: business.name || '',
        industry: business.industry || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        description: business.description || ''
      })
      setBusinessFormError('')
      setBusinessNotice('')
    }

    const updateBusinessForm = (event) => {
      const { name, value } = event.target
      setBusinessForm((current) => ({ ...current, [name]: value }))
      if (businessFormError) setBusinessFormError('')
    }

    const handleBusinessUpdate = async (event) => {
      event.preventDefault()
      if (!editingBusiness) return
      setIsUpdatingBusiness(true)
      setBusinessFormError('')
      try {
        await businessService.update(editingBusiness.id, {
          name: businessForm.name.trim(),
          industry: businessForm.industry.trim(),
          phone: businessForm.phone.trim() || null,
          email: businessForm.email.trim() || null,
          address: businessForm.address.trim() || null,
          description: businessForm.description.trim() || null
        })
        setEditingBusiness(null)
        setBusinessNotice('Business profile updated successfully.')
        await loadBusinesses(page, appliedSearch)
      } catch (error) {
        setBusinessFormError(getErrorMessage(error))
      } finally {
        setIsUpdatingBusiness(false)
      }
    }

    const handleBusinessDelete = async (business) => {
      if (!window.confirm(`Delete "${business.name}" and its workspace? This action cannot be undone.`)) return
      setDeletingBusinessId(business.id)
      setLoadError('')
      setBusinessNotice('')
      try {
        await businessService.remove(business.id)
        setBusinessNotice(`${business.name} was deleted.`)
        await loadBusinesses(page, appliedSearch)
      } catch (error) {
        setLoadError(getErrorMessage(error))
      } finally {
        setDeletingBusinessId(null)
      }
    }

    setIsSubmitting(true)
    try {
      const { data } = await businessService.onboard({
        name: form.name.trim(),
        industry: form.industry.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword
      })
      const created = data?.data
      if (!created?.business || !created?.user) {
        throw new Error('The server did not return the new business and admin account.')
      }

      setCreatedAccount(created)
      setForm(emptyForm)
      setIsOnboarding(false)
      await loadBusinesses(page, appliedSearch)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="businesses-page">
      <div className="businesses-breadcrumb">
        <span>Workspace</span><span className="breadcrumb-divider">/</span><strong>Businesses</strong>
      </div>

      <section className="businesses-heading">
        <div>
          <div className="businesses-eyebrow"><span className="eyebrow-dot" /> {isSuperAdmin ? 'PLATFORM MANAGEMENT' : 'YOUR WORKSPACE'}</div>
          <h1>{isSuperAdmin ? 'Business accounts' : businessProfile?.name || 'Your business'}</h1>
          <p>{isSuperAdmin ? 'Manage your business tenants and the teams behind every conversation.' : 'Your business profile and workspace overview.'}</p>
        </div>
        {isSuperAdmin && (
          <button className="primary-button" onClick={() => setIsOnboarding(true)} type="button">
            <Plus size={18} /> Onboard business
          </button>
        )}
      </section>

      {createdAccount && (
        <section className="onboarding-success" role="status">
          <span className="success-icon"><CheckCircle2 size={21} /></span>
          <div className="success-copy">
            <strong>{createdAccount.business.name} is ready</strong>
            <span>
              Business admin <b>{createdAccount.user.name}</b> was assigned{' '}
              <b>{createdAccount.user.email}</b> sign-in access.
            </span>
          </div>
          <span className="success-role"><ShieldCheck size={15} /> BUSINESS ADMIN</span>
          <button aria-label="Dismiss success message" className="icon-button success-dismiss" onClick={() => setCreatedAccount(null)} type="button">
            <X size={17} />
          </button>
        </section>
      )}
      {businessNotice && <div className="resource-notice" role="status">{businessNotice}</div>}

      <section className="business-overview">
        <div className="overview-copy">
          <span className="overview-icon"><Building2 size={20} /></span>
          <div>
            <span className="overview-label">{isSuperAdmin ? 'TOTAL WORKSPACES' : 'YOUR BUSINESS'}</span>
            <strong>{isLoading ? '—' : isSuperAdmin ? total.toLocaleString() : businessProfile?.industry || 'Workspace'}</strong>
          </div>
        </div>
        <div className="overview-divider" />
        <div className="overview-detail">
          <ShieldCheck size={17} />
          <span>{isSuperAdmin ? 'Each workspace is isolated and managed independently.' : businessProfile?.address || businessProfile?.description || 'Your workspace data is isolated and managed securely.'}</span>
        </div>
        {isSuperAdmin && (
          <button className="text-button" onClick={() => setIsOnboarding(true)} type="button">
            Create workspace <ArrowUpRight size={15} />
          </button>
        )}
      </section>

      {!isSuperAdmin && businessProfile && (
        <section className="business-profile-grid">
          <article className="business-profile-card">
            <span className="profile-card-label">BUSINESS CONTACT</span>
            <a href={`mailto:${businessProfile.email}`}><Mail size={15} />{businessProfile.email || 'No email on file'}</a>
            <span className="business-profile-muted">{businessProfile.phone || 'No phone on file'}</span>
          </article>
          <article className="business-profile-card">
            <span className="profile-card-label">WORKSPACE TEAM</span>
            <strong>{businessProfile.staff?.length ?? '—'} <small>staff members</small></strong>
            <strong>{businessProfile.services?.length ?? '—'} <small>services</small></strong>
          </article>
          <article className="business-profile-card">
            <span className="profile-card-label">RECENT ACTIVITY</span>
            <strong>{businessProfile.appointments?.length ?? '—'} <small>appointments</small></strong>
            <strong>{businessProfile.conversations?.length ?? '—'} <small>conversations</small></strong>
          </article>
        </section>
      )}

      <section className="businesses-table-card">
        <div className="table-card-heading">
          <div>
            <h2>{isSuperAdmin ? 'All businesses' : 'Business profile'}</h2>
            <p>{isSuperAdmin ? 'Business profiles and admin access' : 'Your business identity and contact information'}</p>
          </div>
          {isSuperAdmin && (
            <label className="business-search">
              <Search size={17} />
              <input
                aria-label="Search businesses by name"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by business name..."
                type="search"
                value={search}
              />
            </label>
          )}
        </div>

        {loadError && (
          <div className="business-load-error" role="alert">
            <CircleHelp size={18} />
            <span>{loadError}</span>
            <button className="text-button" onClick={() => loadBusinesses()} type="button">Retry</button>
          </div>
        )}

        <div className="business-table-scroll">
          <table className="business-table">
            <thead>
              <tr>
                <th>BUSINESS</th>
                <th>INDUSTRY</th>
                <th>CONTACT</th>
                <th>ONBOARDED</th>
                <th className="resource-actions-heading">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="table-message" colSpan="5">Loading business accounts…</td></tr>
              )}
              {!isLoading && !loadError && businesses.map((business) => (
                <tr key={business.id}>
                  <td>
                    <div className="business-name-cell">
                      <span className="business-avatar">{business.name?.[0]?.toUpperCase() || <Building2 size={17} />}</span>
                      <span><strong>{business.name}</strong><small>{business.id}</small></span>
                    </div>
                  </td>
                  <td><span className="industry-tag">{business.industry || 'Unspecified'}</span></td>
                  <td>
                    <a className="contact-link" href={`mailto:${business.email}`}>
                      <Mail size={14} /> {business.email || '—'}
                    </a>
                    {business.phone && <small className="contact-phone">{business.phone}</small>}
                  </td>
                  <td className="date-cell">{formatDate(business.createdAt)}</td>
                  <td>
                    <div className="resource-row-actions">
                      <button aria-label={`Edit ${business.name}`} className="icon-button" onClick={() => openBusinessEditor(business)} title="Edit business" type="button">
                        <Edit size={16} />
                      </button>
                      {isSuperAdmin && (
                        <button aria-label={`Delete ${business.name}`} className="icon-button resource-delete" disabled={deletingBusinessId === business.id} onClick={() => handleBusinessDelete(business)} title="Delete business" type="button">
                          <Delete size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !loadError && businesses.length === 0 && (
                <tr>
                  <td className="table-message" colSpan="5">
                    {appliedSearch
                      ? 'No businesses match your search.'
                      : isSuperAdmin
                        ? 'No businesses yet. Onboard your first business to get started.'
                        : 'Your business workspace could not be found.'}
                    {!appliedSearch && isSuperAdmin && (
                      <button className="empty-onboard-button" onClick={() => setIsOnboarding(true)} type="button">
                        <Plus size={16} /> Onboard a business
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isSuperAdmin && (
          <div className="table-footer">
            <span>
              Showing <strong>{total ? ((page - 1) * 10) + 1 : 0}–{Math.min(page * 10, total)}</strong> of <strong>{total}</strong> businesses
            </span>
            <div className="pagination-controls">
              <span>Page {page} of {totalPages}</span>
              <button className="pagination-button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
              <button className="pagination-button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">Next</button>
            </div>
          </div>
        )}
      </section>

      {isOnboarding && (
        <div className="onboarding-overlay" onMouseDown={closeOnboarding} role="presentation">
          <section
            aria-labelledby="onboarding-title"
            aria-modal="true"
            className="onboarding-panel"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="onboarding-header">
              <div>
                <span className="onboarding-step-label">NEW WORKSPACE · 01 / 01</span>
                <h2 id="onboarding-title">Onboard a business</h2>
                <p>Create the workspace and assign its first business admin.</p>
              </div>
              <button aria-label="Close onboarding" className="icon-button" disabled={isSubmitting} onClick={closeOnboarding} type="button">
                <X size={20} />
              </button>
            </header>

            <form className="onboarding-form" onSubmit={handleOnboard}>
              <div className="form-section-title">
                <span className="form-section-icon"><Building2 size={17} /></span>
                <div><strong>Business profile</strong><small>Workspace identity and primary contact</small></div>
              </div>

              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Business name <b>*</b></span>
                  <input autoComplete="organization" maxLength="255" name="name" onChange={updateForm} placeholder="e.g. Northstar Health Group" required value={form.name} />
                </label>
                <label className="form-field">
                  <span>Industry <b>*</b></span>
                  <input maxLength="255" name="industry" onChange={updateForm} placeholder="e.g. Healthcare" required value={form.industry} />
                </label>
                <label className="form-field">
                  <span>Business phone</span>
                  <input autoComplete="tel" maxLength="50" name="phone" onChange={updateForm} placeholder="+1 (555) 000-0000" type="tel" value={form.phone} />
                </label>
                <label className="form-field form-field-wide">
                  <span>Business email</span>
                  <input autoComplete="email" maxLength="255" name="email" onChange={updateForm} placeholder="hello@business.com" type="email" value={form.email} />
                </label>
              </div>

              <div className="form-section-title admin-section-title">
                <span className="form-section-icon admin-section-icon"><UserRound size={17} /></span>
                <div><strong>Business admin access</strong><small>This account will manage the new workspace</small></div>
                <span className="admin-role-chip"><ShieldCheck size={13} /> BUSINESS ADMIN</span>
              </div>

              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Admin full name <b>*</b></span>
                  <input autoComplete="name" maxLength="255" name="adminName" onChange={updateForm} placeholder="e.g. Jordan Lee" required value={form.adminName} />
                </label>
                <label className="form-field form-field-wide">
                  <span>Admin email <b>*</b></span>
                  <input autoComplete="off" name="adminEmail" onChange={updateForm} placeholder="admin@business.com" required type="email" value={form.adminEmail} />
                  <small>Sign-in email for the business admin account.</small>
                </label>
                <label className="form-field">
                  <span>Initial password <b>*</b></span>
                  <input autoComplete="new-password" minLength="6" name="adminPassword" onChange={updateForm} placeholder="At least 6 characters" required type="password" value={form.adminPassword} />
                </label>
                <label className="form-field">
                  <span>Confirm password <b>*</b></span>
                  <input autoComplete="new-password" minLength="6" name="confirmPassword" onChange={updateForm} placeholder="Re-enter password" required type="password" value={form.confirmPassword} />
                </label>
              </div>

              {formError && <div className="onboarding-error" role="alert"><CircleHelp size={17} /> {formError}</div>}

              <div className="credential-notice">
                <ShieldCheck size={17} />
                <span>The password is sent securely to the API for account creation. Share it with the admin through your approved secure channel.</span>
              </div>

              <footer className="onboarding-actions">
                <button className="secondary-button" disabled={isSubmitting} onClick={closeOnboarding} type="button">Cancel</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Creating workspace…' : <><Check size={17} /> Create business & admin</>}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {editingBusiness && (
        <div className="onboarding-overlay" onMouseDown={() => !isUpdatingBusiness && setEditingBusiness(null)} role="presentation">
          <section aria-labelledby="business-edit-title" aria-modal="true" className="onboarding-panel resource-form-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog">
            <header className="onboarding-header">
              <div>
                <span className="onboarding-step-label">WORKSPACE PROFILE</span>
                <h2 id="business-edit-title">Edit business</h2>
                <p>Update your business contact and workspace details.</p>
              </div>
              <button aria-label="Close business editor" className="icon-button" disabled={isUpdatingBusiness} onClick={() => setEditingBusiness(null)} type="button"><X size={19} /></button>
            </header>
            <form className="onboarding-form" onSubmit={handleBusinessUpdate}>
              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Business name <b>*</b></span>
                  <input autoComplete="organization" maxLength="255" name="name" onChange={updateBusinessForm} required value={businessForm.name || ''} />
                </label>
                <label className="form-field">
                  <span>Industry <b>*</b></span>
                  <input maxLength="255" name="industry" onChange={updateBusinessForm} required value={businessForm.industry || ''} />
                </label>
                <label className="form-field">
                  <span>Phone</span>
                  <input maxLength="50" name="phone" onChange={updateBusinessForm} type="tel" value={businessForm.phone || ''} />
                </label>
                <label className="form-field form-field-wide">
                  <span>Email</span>
                  <input autoComplete="email" maxLength="255" name="email" onChange={updateBusinessForm} type="email" value={businessForm.email || ''} />
                </label>
                <label className="form-field form-field-wide">
                  <span>Address</span>
                  <input maxLength="500" name="address" onChange={updateBusinessForm} value={businessForm.address || ''} />
                </label>
                <label className="form-field form-field-wide">
                  <span>Description</span>
                  <textarea maxLength="2000" name="description" onChange={updateBusinessForm} rows="3" value={businessForm.description || ''} />
                </label>
              </div>
              {businessFormError && <div className="onboarding-error" role="alert">{businessFormError}</div>}
              <footer className="onboarding-actions">
                <button className="secondary-button" disabled={isUpdatingBusiness} onClick={() => setEditingBusiness(null)} type="button">Cancel</button>
                <button className="primary-button" disabled={isUpdatingBusiness} type="submit">{isUpdatingBusiness ? 'Saving…' : <><Check size={17} /> Save changes</>}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default BusinessesPage
