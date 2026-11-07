import { useEffect, useState } from 'react'
import { RiTimeLine } from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { availabilityService, staffService } from '@/lib/api'

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const dayOptions = days.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase()
}))

const dayLabel = (day) => day
  ? day.charAt(0) + day.slice(1).toLowerCase()
  : '—'

const staffScheduleLoader = async () => {
  const { data } = await staffService.myAvailability()
  const records = Array.isArray(data?.data) ? data.data : []
  return {
    data: {
      data: records,
      meta: { page: 1, limit: 100, total: records.length, totalPages: 1 }
    }
  }
}

const StaffAvailabilityPage = () => (
  <ResourceTablePage
    canDelete
    canEdit
    columns={[
      { label: 'DAY', render: (record) => dayLabel(record.dayOfWeek) },
      { label: 'START', key: 'startTime' },
      { label: 'END', key: 'endTime' },
      { label: 'SCHEDULE', render: (record) => `${record.startTime} – ${record.endTime}` }
    ]}
    description="Review and adjust your own weekly working hours."
    editFields={[
      { name: 'dayOfWeek', label: 'Day of week', type: 'select', required: true, options: dayOptions },
      { name: 'startTime', label: 'Start time', type: 'time', required: true },
      { name: 'endTime', label: 'End time', type: 'time', required: true }
    ]}
    emptyMessage="No availability has been set for your account."
    eyebrow="MY SCHEDULE"
    icon={RiTimeLine}
    loader={staffScheduleLoader}
    onDelete={(record) => availabilityService.remove(record.id)}
    onSave={(record, values) => availabilityService.update(record.id, {
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime
    })}
    readOnlyMessage="This schedule is only visible to you and your business administrator."
    singular="Availability slot"
    title="Availability"
  />
)

const BusinessAvailabilityPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === ROLES.SUPERADMIN || user?.role === ROLES.BUSINESS_ADMIN
  const [staffOptions, setStaffOptions] = useState([])
  const [optionsError, setOptionsError] = useState('')

  useEffect(() => {
    if (!canManage) return undefined
    let active = true
    staffService.list({ page: 1, limit: 100 })
      .then(({ data }) => {
        if (active) {
          setStaffOptions((data?.data || []).map((staff) => ({
            value: staff.id,
            label: `${staff.name} · ${staff.role}`
          })))
        }
      })
      .catch((error) => {
        if (active) setOptionsError(error.response?.data?.message || error.message || 'Could not load staff members.')
      })
    return () => { active = false }
  }, [canManage])

  const fields = [
    { name: 'staffId', label: 'Staff member', type: 'select', options: staffOptions, placeholder: optionsError ? 'Staff list unavailable' : 'Select staff', required: true, wide: true },
    { name: 'dayOfWeek', label: 'Day of week', type: 'select', options: dayOptions, required: true },
    { name: 'startTime', label: 'Start time', type: 'time', required: true },
    { name: 'endTime', label: 'End time', type: 'time', required: true }
  ]

  return (
    <ResourceTablePage
      canCreate={canManage}
      canDelete={canManage}
      canEdit={canManage}
      columns={[
        { label: 'STAFF MEMBER', key: 'staff.name' },
        { label: 'DAY', render: (record) => dayLabel(record.dayOfWeek) },
        { label: 'WORKING HOURS', render: (record) => `${record.startTime} – ${record.endTime}` }
      ]}
      description="Set and maintain working hours for each member of your team."
      editFields={[
        { name: 'dayOfWeek', label: 'Day of week', type: 'select', required: true, options: dayOptions },
        { name: 'startTime', label: 'Start time', type: 'time', required: true },
        { name: 'endTime', label: 'End time', type: 'time', required: true }
      ]}
      emptyMessage="No working hours have been configured yet."
      formFields={fields}
      icon={RiTimeLine}
      loader={availabilityService.list}
      onDelete={(record) => availabilityService.remove(record.id)}
      onSave={(record, values) => record
        ? availabilityService.update(record.id, {
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime
          })
        : availabilityService.create({
            staffId: values.staffId,
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime
          })}
      readOnlyMessage={!canManage ? 'Availability is read-only for your role.' : ''}
      searchParam="staffId"
      searchPlaceholder="Search staff ID..."
      singular="Availability slot"
      title="Availability"
    />
  )
}

export const AvailabilityPage = () => {
  const { user } = useAuth()
  return user?.role === ROLES.STAFF ? <StaffAvailabilityPage /> : <BusinessAvailabilityPage />
}

export default AvailabilityPage
