import { useEffect, useState } from 'react'
import { RiSoundModuleLine } from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { businessService, serviceService } from '@/lib/api'

const formatPrice = (price) => {
  const amount = Number(price)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : '—'
}

const statusBadge = (active) => (
  <span className={`resource-status ${active ? 'is-active' : 'is-inactive'}`}>
    <span /> {active ? 'Active' : 'Inactive'}
  </span>
)

export const ServicesPage = () => {
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
    { name: 'name', label: 'Service name', required: true, maxLength: 255, placeholder: 'e.g. Initial consultation', wide: true },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000, wide: true, placeholder: 'What is included in this service?' },
    { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', required: true, min: 1, step: 1 },
    { name: 'price', label: 'Price (USD)', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'isActive', label: 'Service status', type: 'checkbox' }
  ]

  const editFields = [
    { name: 'name', label: 'Service name', required: true, maxLength: 255, wide: true },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000, wide: true },
    { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', required: true, min: 1, step: 1 },
    { name: 'price', label: 'Price (USD)', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'isActive', label: 'Service status', type: 'checkbox' }
  ]

  return (
    <ResourceTablePage
      canCreate={canManage}
      canDelete={canManage}
      canEdit={canManage}
      columns={[
        { label: 'SERVICE', key: 'name' },
        { label: 'DURATION', render: (service) => `${service.durationMinutes} min` },
        { label: 'PRICE', render: (service) => formatPrice(service.price) },
        { label: 'BUSINESS', key: 'business.name' },
        { label: 'STATUS', render: (service) => statusBadge(service.isActive) }
      ]}
      description="Review services, pricing, and appointment durations across your workspace."
      detailsFields={[
        { label: 'Service', key: 'name' },
        { label: 'Business', key: 'business.name' },
        { label: 'Duration', render: (service) => `${service.durationMinutes} minutes` },
        { label: 'Price', render: (service) => formatPrice(service.price) },
        { label: 'Status', render: (service) => statusBadge(service.isActive) },
        { label: 'Description', key: 'description', wide: true }
      ]}
      emptyMessage="No services are configured for this workspace."
      editFields={editFields}
      filters={[{ name: 'isActive', label: 'Status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] }]}
      formFields={formFields}
      icon={RiSoundModuleLine}
      loader={serviceService.list}
      onDelete={(service) => serviceService.remove(service.id)}
      onSave={(service, values) => {
        const payload = {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          durationMinutes: Number(values.durationMinutes),
          price: Number(values.price),
          isActive: values.isActive
        }
        return service
          ? serviceService.update(service.id, payload)
          : serviceService.create({ ...payload, businessId: user?.businessId || values.businessId })
      }}
      readOnlyMessage={!canManage ? 'Service catalog is read-only for your role.' : ''}
      searchParam="name"
      searchPlaceholder="Search services..."
      singular="Service"
      title="Services"
    />
  )
}

export default ServicesPage
