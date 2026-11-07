import { RiUserLine } from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { customerService } from '@/lib/api'

export const CustomersPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === ROLES.SUPERADMIN || user?.role === ROLES.BUSINESS_ADMIN

  const fields = [
    { name: 'name', label: 'Customer name', required: true, maxLength: 255, placeholder: 'Full name', wide: true },
    { name: 'phone', label: 'Phone number', type: 'tel', required: true, minLength: 5, maxLength: 50, placeholder: '+1 (555) 000-0000' },
    { name: 'email', label: 'Email', type: 'email', maxLength: 255, placeholder: 'customer@example.com' }
  ]

  return (
    <ResourceTablePage
      canCreate={canManage}
      canDelete={canManage}
      canEdit={canManage}
      columns={[
        { label: 'CUSTOMER', key: 'name' },
        { label: 'PHONE', key: 'phone' },
        { label: 'EMAIL', key: 'email' },
        { label: 'APPOINTMENTS', render: (customer) => customer._count?.appointments ?? customer.appointments?.length ?? '—' },
        { label: 'CONVERSATIONS', render: (customer) => customer._count?.conversations ?? customer.conversations?.length ?? '—' }
      ]}
      description="View customer contact details and their activity in your business."
      detailsFields={[
        { label: 'Customer', key: 'name' },
        { label: 'Phone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Appointments', render: (customer) => customer.appointments?.length ?? '—' },
        { label: 'Conversations', render: (customer) => customer.conversations?.length ?? '—' }
      ]}
      emptyMessage="No customer records match this workspace."
      formFields={fields}
      icon={RiUserLine}
      loader={customerService.list}
      onDelete={(customer) => customerService.remove(customer.id)}
      onSave={(customer, values) => {
        const payload = {
          name: values.name.trim(),
          phone: values.phone.trim(),
          ...(values.email?.trim() ? { email: values.email.trim() } : {})
        }
        return customer
          ? customerService.update(customer.id, payload)
          : customerService.create(payload)
      }}
      readOnlyMessage={!canManage ? 'Customer records are read-only for your role.' : ''}
      searchParam="name"
      searchPlaceholder="Search customers..."
      singular="Customer"
      title="Customers"
    />
  )
}

export default CustomersPage
