import { useCallback, useEffect, useState } from 'react'
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiRefreshLine,
  RiSearchLine
} from '@remixicon/react'

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'The request could not be completed.'

const readPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object)

const formatFieldValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const initialFormValue = (field) => field.defaultValue ?? (field.type === 'checkbox' ? true : '')

export const ResourceTablePage = ({
  title,
  singular = title.replace(/s$/, ''),
  eyebrow = 'BUSINESS OPERATIONS',
  description,
  icon: PageIcon,
  loader,
  columns,
  searchParam,
  searchPlaceholder = 'Search records...',
  filters = [],
  pageSize = 10,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  formFields = [],
  editFields = formFields,
  onSave,
  onDelete,
  detailsFields,
  headerActions,
  stats = [],
  emptyMessage = 'No records found.',
  readOnlyMessage,
  refreshKey = 0
}) => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [details, setDetails] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState('')

  const loadRows = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const params = { page, limit: pageSize }
      if (searchParam && appliedSearch) params[searchParam] = appliedSearch
      Object.entries(filterValues).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) params[key] = value
      })

      const { data } = await loader(params)
      const resultRows = Array.isArray(data?.data) ? data.data : []
      setRows(resultRows)
      setTotal(Number(data?.meta?.total) || resultRows.length)
      setTotalPages(Math.max(1, Number(data?.meta?.totalPages) || 1))
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [loader, page, pageSize, searchParam, appliedSearch, filterValues, refreshKey])

  useEffect(() => {
    loadRows()
  }, [loadRows])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setAppliedSearch(search.trim())
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  const openForm = (record = null) => {
    const fields = record ? editFields : formFields
    const nextValues = Object.fromEntries(
      fields.map((field) => [
        field.name,
        record ? (readPath(record, field.valuePath || field.name) ?? initialFormValue(field)) : initialFormValue(field)
      ])
    )
    setEditing(record)
    setIsFormOpen(true)
    setFormValues(nextValues)
    setFormError('')
    setNotice('')
  }

  const closeForm = () => {
    if (isSaving) return
    setEditing(null)
    setIsFormOpen(false)
    setFormError('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!onSave) return
    setIsSaving(true)
    setFormError('')
    try {
      await onSave(editing, formValues)
      setEditing(null)
      setIsFormOpen(false)
      setNotice(editing ? 'Changes saved successfully.' : 'Record created successfully.')
      await loadRows()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (record) => {
    if (!onDelete || deletingId) return
    if (!window.confirm(`Delete "${record.name || record.id}"? This action cannot be undone.`)) return
    setDeletingId(record.id)
    setLoadError('')
    setNotice('')
    try {
      await onDelete(record)
      setNotice('Record deleted successfully.')
      await loadRows()
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  const updateFormValue = (field, value) => {
    let normalized = value
    if (field.type === 'number' && value !== '') normalized = Number(value)
    if (field.type === 'checkbox') normalized = value.target.checked
    setFormValues((current) => ({ ...current, [field.name]: normalized }))
    if (formError) setFormError('')
  }

  const visibleFields = editing ? editFields : formFields

  return (
    <div className="resource-page">
      <div className="businesses-breadcrumb">
        <span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{title}</strong>
      </div>

      <section className="businesses-heading resource-heading">
        <div>
          <div className="businesses-eyebrow">
            {PageIcon && <span className="resource-page-icon"><PageIcon size={14} /></span>}
            <span className="eyebrow-dot" /> {eyebrow}
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="resource-header-actions">
          {headerActions}
          <button className="secondary-button resource-refresh" disabled={isLoading} onClick={loadRows} type="button" aria-label={`Refresh ${title.toLowerCase()}`}>
            <RiRefreshLine size={16} /> Refresh
          </button>
          {canCreate && (
            <button className="primary-button" onClick={() => openForm()} type="button">
              <RiAddLine size={17} /> Add {singular.toLowerCase()}
            </button>
          )}
        </div>
      </section>

      {notice && <div className="resource-notice" role="status">{notice}</div>}
      {readOnlyMessage && <div className="resource-readonly-note">{readOnlyMessage}</div>}

      {stats.length > 0 && (
        <section className="resource-stats" aria-label={`${title} summary`}>
          {stats.map((stat) => (
            <article className="resource-stat" key={stat.label}>
              <span className={`resource-stat-icon ${stat.tone || ''}`}>{stat.icon && <stat.icon size={18} />}</span>
              <span className="resource-stat-copy"><small>{stat.label}</small><strong>{stat.value}</strong></span>
            </article>
          ))}
        </section>
      )}

      <section className="businesses-table-card resource-table-card">
        <div className="table-card-heading">
          <div>
            <h2>{title} records</h2>
            <p>{total.toLocaleString()} total {title.toLowerCase()}</p>
          </div>
          <div className="resource-table-tools">
            {filters.map((filter) => (
              <label className="resource-filter" key={filter.name}>
                <span className="sr-only">{filter.label}</span>
                <select
                  aria-label={filter.label}
                  onChange={(event) => {
                    setPage(1)
                    setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))
                  }}
                  value={filterValues[filter.name] ?? ''}
                >
                  <option value="">{filter.placeholder || `All ${filter.label.toLowerCase()}`}</option>
                  {filter.options.map((option) => (
                    <option key={String(option.value)} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className="business-search resource-search">
              <RiSearchLine size={16} />
              <input
                aria-label={`Search ${title.toLowerCase()}`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                type="search"
                value={search}
              />
            </label>
          </div>
        </div>

        {loadError && (
          <div className="business-load-error" role="alert">
            <span>{loadError}</span>
            <button className="text-button" onClick={loadRows} type="button">Retry</button>
          </div>
        )}

        <div className="business-table-scroll">
          <table className="business-table resource-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.label}>{column.label}</th>)}
                {(detailsFields || canEdit || canDelete) && <th className="resource-actions-heading">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td className="table-message" colSpan={columns.length + (detailsFields || canEdit || canDelete ? 1 : 0)}>Loading {title.toLowerCase()}…</td></tr>}
              {!isLoading && !loadError && rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.label}>
                      {column.render ? column.render(row) : formatFieldValue(readPath(row, column.key))}
                    </td>
                  ))}
                  {(detailsFields || canEdit || canDelete) && (
                    <td>
                      <div className="resource-row-actions">
                        {detailsFields && (
                          <button aria-label={`View ${row.name || singular.toLowerCase()}`} className="icon-button" onClick={() => setDetails(row)} title="View details" type="button">
                            <RiEyeLine size={16} />
                          </button>
                        )}
                        {canEdit && (
                          <button aria-label={`Edit ${row.name || singular.toLowerCase()}`} className="icon-button" onClick={() => openForm(row)} title="Edit" type="button">
                            <RiEditLine size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button aria-label={`Delete ${row.name || singular.toLowerCase()}`} className="icon-button resource-delete" disabled={deletingId === row.id} onClick={() => handleDelete(row)} title="Delete" type="button">
                            <RiDeleteBinLine size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && !loadError && rows.length === 0 && (
                <tr>
                  <td className="table-message" colSpan={columns.length + (detailsFields || canEdit || canDelete ? 1 : 0)}>
                    {emptyMessage}
                    {canCreate && rows.length === 0 && (
                      <button className="empty-onboard-button" onClick={() => openForm()} type="button">
                        <RiAddLine size={15} /> Add your first {singular.toLowerCase()}
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing <strong>{total ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>
          </span>
          <div className="pagination-controls">
            <span>Page {page} of {totalPages}</span>
            <button aria-label="Previous page" className="pagination-button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)} type="button">
              <RiArrowLeftSLine size={16} />
            </button>
            <button aria-label="Next page" className="pagination-button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)} type="button">
              <RiArrowRightSLine size={16} />
            </button>
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div className="onboarding-overlay" onMouseDown={closeForm} role="presentation">
          <section aria-labelledby="resource-form-title" aria-modal="true" className="onboarding-panel resource-form-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog">
            <header className="onboarding-header">
              <div>
                <span className="onboarding-step-label">{editing ? 'UPDATE RECORD' : 'NEW RECORD'}</span>
                <h2 id="resource-form-title">{editing ? `Edit ${singular.toLowerCase()}` : `Add ${singular.toLowerCase()}`}</h2>
                <p>{description}</p>
              </div>
              <button aria-label="Close form" className="icon-button" disabled={isSaving} onClick={closeForm} type="button"><RiCloseLine size={19} /></button>
            </header>
            <form className="onboarding-form" onSubmit={handleSave}>
              <div className="form-grid">
                {visibleFields.map((field) => (
                  <label className={`form-field ${field.wide ? 'form-field-wide' : ''}`} key={field.name}>
                    <span>{field.label}{field.required && <b> *</b>}</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        maxLength={field.maxLength}
                        name={field.name}
                        onChange={(event) => updateFormValue(field, event.target.value)}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                        rows={field.rows || 3}
                        value={formValues[field.name] ?? ''}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        onChange={(event) => updateFormValue(field, event.target.value)}
                        required={field.required}
                        value={formValues[field.name] ?? ''}
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {(field.getOptions ? field.getOptions(formValues) : field.options || []).map((option) => (
                          <option key={String(option.value)} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <span className="resource-checkbox-wrap">
                        <input checked={!!formValues[field.name]} name={field.name} onChange={(event) => updateFormValue(field, event)} type="checkbox" />
                        <span>{formValues[field.name] ? 'Active' : 'Inactive'}</span>
                      </span>
                    ) : (
                      <input
                        autoComplete={field.autoComplete}
                        max={field.max}
                        maxLength={field.maxLength}
                        min={field.min}
                        minLength={field.minLength}
                        name={field.name}
                        onChange={(event) => updateFormValue(field, event.target.value)}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                        step={field.step}
                        type={field.type || 'text'}
                        value={formValues[field.name] ?? ''}
                      />
                    )}
                    {field.help && <small>{field.help}</small>}
                  </label>
                ))}
              </div>
              {formError && <div className="onboarding-error" role="alert">{formError}</div>}
              <footer className="onboarding-actions">
                <button className="secondary-button" disabled={isSaving} onClick={closeForm} type="button">Cancel</button>
                <button className="primary-button" disabled={isSaving} type="submit">
                  {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create record'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {details && detailsFields && (
        <div className="onboarding-overlay" onMouseDown={() => setDetails(null)} role="presentation">
          <section aria-labelledby="resource-details-title" aria-modal="true" className="onboarding-panel resource-form-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog">
            <header className="onboarding-header">
              <div><span className="onboarding-step-label">RECORD DETAILS</span><h2 id="resource-details-title">{details.name || title.replace(/s$/, '')}</h2></div>
              <button aria-label="Close details" className="icon-button" onClick={() => setDetails(null)} type="button"><RiCloseLine size={19} /></button>
            </header>
            <div className="resource-detail-content">
              {detailsFields.map((field) => (
                <section className={`resource-detail-field ${field.wide ? 'is-wide' : ''}`} key={field.label}>
                  <span>{field.label}</span>
                  <div>{field.render ? field.render(details) : formatFieldValue(readPath(details, field.key))}</div>
                </section>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
