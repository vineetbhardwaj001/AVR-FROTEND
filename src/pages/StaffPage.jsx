import { useEffect, useState } from 'react'
import { RiGroupLine } from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { businessService, staffService } from '@/lib/api'

const staffRoles = ['Dentist', 'Doctor', 'Specialist', 'Nurse', 'Receptionist', 'Assistant', 'Other']

const statusBadge = (active) => (
  <span className={`resource-status ${active ? 'is-active' : 'is-inactive'}`}>
    <span /> {active ? 'Active' : 'Inactive'}
  </span>
)

const dateLabel = (value) => value
  ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
  : '—'

export const StaffPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === ROLES.SUPERADMIN || user?.role === ROLES.BUSINESS_ADMIN
  const [businessOptions, setBusinessOptions] = useState([])
  const [optionsError, setOptionsError] = useState('')

  useEffect(() => {
    if (user?.role !== ROLES.SUPERADMIN) return undefined
    let active = true
    businessService.list({ page: 1, limit: 100 })
      .then(({ data }) => {
        if (active) setBusinessOptions((data?.data || []).map((business) => ({ value: business.id, label: business.name })))
      })
      .catch((error) => {
        if (active) setOptionsError(error.response?.data?.message || error.message || 'Could not load businesses.')
      })
    return () => { active = false }
  }, [user?.role])

  const formFields = [
    ...(user?.role === ROLES.SUPERADMIN
      ? [{
          name: 'businessId',
          label: 'Business',
          type: 'select',
          options: businessOptions,
          placeholder: optionsError ? 'Business list unavailable' : 'Select a business',
          required: true,
          wide: true
        }]
      : []),
    { name: 'name', label: 'Staff name', required: true, placeholder: 'e.g. Dr. Sarah Lee', wide: true, maxLength: 255 },
    { name: 'role', label: 'Position', type: 'select', required: true, options: staffRoles.map((value) => ({ value, label: value })) },
    { name: 'bio', label: 'Short bio', type: 'textarea', wide: true, maxLength: 2000, placeholder: 'Experience or areas of expertise' },
    { name: 'email', label: 'Staff sign-in email', type: 'email', required: true, placeholder: 'staff@business.com' },
    { name: 'password', label: 'Temporary password', type: 'password', required: true, minLength: 6, autoComplete: 'new-password', placeholder: 'At least 6 characters' },
    { name: 'confirmPassword', label: 'Confirm password', type: 'password', required: true, minLength: 6, autoComplete: 'new-password', placeholder: 'Re-enter the password' }
  ]

  const editFields = [
    { name: 'name', label: 'Staff name', required: true, maxLength: 255 },
    { name: 'role', label: 'Position', required: true, maxLength: 255 },
    { name: 'bio', label: 'Short bio', type: 'textarea', wide: true, maxLength: 2000 },
    { name: 'isActive', label: 'Staff status', type: 'checkbox' }
  ]

  return (
    <ResourceTablePage
      canCreate={canManage}
      canDelete={canManage}
      canEdit={canManage}
      columns={[
        { label: 'STAFF MEMBER', key: 'name' },
        { label: 'POSITION', key: 'role' },
        { label: 'BUSINESS', key: 'business.name' },
        { label: 'STATUS', render: (staff) => statusBadge(staff.isActive) },
        { label: 'JOINED', render: (staff) => dateLabel(staff.createdAt) }
      ]}
      description="Manage staff profiles and provision secure team sign-in accounts."
      detailsFields={[
        { label: 'Full name', key: 'name' },
        { label: 'Position', key: 'role' },
        { label: 'Business', key: 'business.name' },
        { label: 'Status', render: (staff) => statusBadge(staff.isActive) },
        { label: 'Bio', key: 'bio', wide: true },
        { label: 'Created', render: (staff) => dateLabel(staff.createdAt) }
      ]}
      emptyMessage="No staff profiles have been added to this workspace yet."
      editFields={editFields}
      eyebrow="TEAM MANAGEMENT"
      filters={[{ name: 'isActive', label: 'Status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] }]}
      formFields={formFields}
      icon={RiGroupLine}
      loader={staffService.list}
      onDelete={(staff) => staffService.remove(staff.id)}
      onSave={(staff, values) => {
        if (staff) {
          return staffService.update(staff.id, {
            name: values.name.trim(),
            role: values.role,
            bio: values.bio?.trim() || null,
            isActive: values.isActive
          })
        }
        if (values.password !== values.confirmPassword) {
          throw new Error('Passwords do not match.')
        }
        const { confirmPassword, ...account } = values
        return staffService.provision({
          ...account,
          name: account.name.trim(),
          businessId: user?.businessId || account.businessId,
          bio: account.bio?.trim() || null
        })
      }}
      readOnlyMessage={!canManage ? 'Staff profiles are read-only for your role.' : ''}
      searchParam="role"
      searchPlaceholder="Search by position..."
      singular="Staff member"
      title="Staff"
    />
  )
}

export default StaffPage
