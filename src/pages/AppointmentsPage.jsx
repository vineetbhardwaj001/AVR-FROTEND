import { useEffect, useState } from 'react'
import {
  RiCalendarCheckLine,
  RiCalendarLine,
  RiTimeLine
} from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { appointmentService } from '@/lib/api'

const appointmentStatuses = [
  { value: 'BOOKED', label: 'Booked' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No show' }
]

const statusNames = Object.fromEntries(appointmentStatuses.map(({ value, label }) => [value, label]))

const statusBadge = (status) => {
  const isComplete = status === 'COMPLETED'
  return (
    <span className={`resource-status ${isComplete ? 'is-active' : status === 'CANCELLED' || status === 'NO_SHOW' ? 'is-inactive' : 'is-booked'}`}>
      <span /> {isComplete ? 'Successful' : statusNames[status] || status || 'Unknown'}
    </span>
  )
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const appointmentDateCell = (appointment) => {
  const start = new Date(appointment.startTime)
  const isUpcoming = appointment.status === 'BOOKED' && !Number.isNaN(start.getTime()) && start > new Date()
  return (
    <div className="appointment-date-cell">
      <strong>{formatDateTime(appointment.startTime)}</strong>
      {appointment.endTime && <small>Until {new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(appointment.endTime))}</small>}
      {isUpcoming && <span className="appointment-upcoming">Upcoming</span>}
    </div>
  )
}

export const AppointmentsPage = () => {
  const [summaryError, setSummaryError] = useState('')
  const [stats, setStats] = useState([
    { label: 'TOTAL APPOINTMENTS', value: '—', icon: RiCalendarLine },
    { label: 'UPCOMING / BOOKED', value: '—', icon: RiTimeLine },
    { label: 'COMPLETED SUCCESSFULLY', value: '—', icon: RiCalendarCheckLine }
  ])

  useEffect(() => {
    let active = true
    Promise.all([
      appointmentService.list({ page: 1, limit: 1 }),
      appointmentService.list({ page: 1, limit: 1, status: 'BOOKED' }),
      appointmentService.list({ page: 1, limit: 1, status: 'COMPLETED' })
    ]).then(([all, booked, completed]) => {
      if (!active) return
      setStats([
        { label: 'TOTAL APPOINTMENTS', value: Number(all.data?.meta?.total) || 0, icon: RiCalendarLine },
        { label: 'UPCOMING / BOOKED', value: Number(booked.data?.meta?.total) || 0, icon: RiTimeLine },
        { label: 'COMPLETED SUCCESSFULLY', value: Number(completed.data?.meta?.total) || 0, icon: RiCalendarCheckLine }
      ])
    }).catch((error) => {
      if (active) {
        setSummaryError(error.response?.data?.message || error.message || 'Appointment summary is unavailable.')
        setStats([
          { label: 'TOTAL APPOINTMENTS', value: 'Unavailable', icon: RiCalendarLine },
          { label: 'UPCOMING / BOOKED', value: 'Unavailable', icon: RiTimeLine },
          { label: 'COMPLETED SUCCESSFULLY', value: 'Unavailable', icon: RiCalendarCheckLine }
        ])
      }
    })
    return () => { active = false }
  }, [])

  return (
    <ResourceTablePage
      columns={[
        { label: 'DATE & TIME', render: appointmentDateCell },
        { label: 'CUSTOMER', key: 'customer.name' },
        { label: 'SERVICE', key: 'service.name' },
        { label: 'STAFF MEMBER', key: 'staff.name' },
        { label: 'STATUS', render: (appointment) => statusBadge(appointment.status) }
      ]}
      description="Track appointment times and see which visits have been completed successfully."
      detailsFields={[
        { label: 'Status', render: (appointment) => statusBadge(appointment.status) },
        { label: 'Date and time', render: (appointment) => formatDateTime(appointment.startTime) },
        { label: 'Customer', key: 'customer.name' },
        { label: 'Customer email', key: 'customer.email' },
        { label: 'Service', key: 'service.name' },
        { label: 'Staff member', key: 'staff.name' },
        { label: 'Notes', key: 'notes', wide: true }
      ]}
      emptyMessage="No appointments have been recorded for this workspace."
      filters={[{ name: 'status', label: 'Status', options: appointmentStatuses }]}
      icon={RiCalendarLine}
      loader={appointmentService.list}
      readOnlyMessage={`Appointments are view-only here. Booking or changing appointments is not available on this page.${summaryError ? ` Summary could not be loaded: ${summaryError}` : ''}`}
      searchParam="customerId"
      searchPlaceholder="Search customer ID..."
      singular="Appointment"
      stats={stats}
      title="Appointments"
    />
  )
}

export default AppointmentsPage
