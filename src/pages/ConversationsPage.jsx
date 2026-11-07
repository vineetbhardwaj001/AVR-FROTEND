import { RiChatVoiceLine } from '@remixicon/react'
import { ResourceTablePage } from '@/components/resources/ResourceTablePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/config/roles'
import { conversationService } from '@/lib/api'

const dateTimeLabel = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(date)
}

const transcriptDetails = (conversation) => (
  <div className="conversation-transcript">
    {conversation.transcript || 'No transcript is available.'}
  </div>
)

const responseDetails = (conversation) => (
  <div className="conversation-transcript conversation-response">
    {conversation.response || 'No assistant response was recorded.'}
  </div>
)

const metadataDetails = (conversation) => (
  <pre className="conversation-metadata">{JSON.stringify(conversation.metadata || {}, null, 2)}</pre>
)

export const ConversationsPage = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === ROLES.SUPERADMIN
  const formFields = [
    ...(isSuperAdmin
      ? [{ name: 'businessId', label: 'Business ID', required: true, wide: true }]
      : []),
    { name: 'customerId', label: 'Customer ID', required: true, wide: true },
    { name: 'transcript', label: 'Caller transcript', type: 'textarea', required: true, maxLength: 20000, wide: true },
    { name: 'intent', label: 'Intent', maxLength: 255 },
    { name: 'response', label: 'Assistant response', type: 'textarea', maxLength: 20000, wide: true }
  ]
  const editFields = [
    { name: 'intent', label: 'Intent', maxLength: 255 },
    { name: 'response', label: 'Assistant response', type: 'textarea', maxLength: 10000, wide: true }
  ]

  return <ResourceTablePage
    canCreate
    canDelete
    canEdit
    columns={[
      { label: 'CUSTOMER', key: 'customer.name' },
      { label: 'INTENT', key: 'intent' },
      { label: 'SOURCE', render: (conversation) => conversation.metadata?.source || '—' },
      { label: 'LANGUAGE', render: (conversation) => conversation.metadata?.language || '—' },
      { label: 'DATE', render: (conversation) => dateTimeLabel(conversation.createdAt) }
    ]}
    description="Review voice transcripts, caller intent, and the receptionist response."
    detailsFields={[
      { label: 'Customer', key: 'customer.name' },
      { label: 'Intent', key: 'intent' },
      { label: 'Conversation time', render: (conversation) => dateTimeLabel(conversation.createdAt) },
      { label: 'Caller transcript', render: transcriptDetails, wide: true },
      { label: 'Assistant response', render: responseDetails, wide: true },
      { label: 'Metadata', render: metadataDetails, wide: true }
    ]}
    emptyMessage="No conversation records are available for this workspace."
    editFields={editFields}
    formFields={formFields}
    icon={RiChatVoiceLine}
    loader={conversationService.list}
    onDelete={(conversation) => conversationService.remove(conversation.id)}
    onSave={(conversation, values) => conversation
      ? conversationService.update(conversation.id, {
          intent: values.intent?.trim() || null,
          response: values.response?.trim() || null
        })
      : conversationService.create({
          businessId: user?.businessId || values.businessId,
          customerId: values.customerId.trim(),
          transcript: values.transcript.trim(),
          intent: values.intent?.trim() || undefined,
          response: values.response?.trim() || undefined
        })}
    searchParam="customerId"
    searchPlaceholder="Search customer ID..."
    singular="Conversation"
    title="Conversations"
  />
}

export default ConversationsPage
