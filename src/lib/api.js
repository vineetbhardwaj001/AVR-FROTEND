import api from '@/lib/axios'

export const businessService = {
  list: (params = {}) => api.get('/businesses', { params }),
  get: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  onboard: (data) => api.post('/admin/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  remove: (id) => api.delete(`/businesses/${id}`)
}

export const staffService = {
  list: (params = {}) => api.get('/staff', { params }),
  get: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  remove: (id) => api.delete(`/staff/${id}`),
  provision: (data) => api.post('/staff/provision', data),
  myAvailability: () => api.get('/staff/me/availability'),
  updateMyAvailability: (data) => api.put('/staff/me/availability', data)
}

export const serviceService = {
  list: (params = {}) => api.get('/services', { params }),
  get: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`)
}

export const appointmentService = {
  list: (params = {}) => api.get('/appointments', { params }),
  get: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  remove: (id) => api.delete(`/appointments/${id}`),
  staff: (staffId, params = {}) => api.get(`/appointments/staff/${staffId}`, { params }),
  customer: (customerId, params = {}) => api.get(`/appointments/customer/${customerId}`, { params }),
  business: (businessId, params = {}) => api.get(`/appointments/business/${businessId}`, { params })
}

export const customerService = {
  list: (params = {}) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`)
}

export const conversationService = {
  list: (params = {}) => api.get('/conversations', { params }),
  get: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  update: (id, data) => api.put(`/conversations/${id}`, data),
  remove: (id) => api.delete(`/conversations/${id}`),
  customer: (customerId, params = {}) => api.get(`/conversations/customer/${customerId}`, { params }),
  business: (businessId, params = {}) => api.get(`/conversations/business/${businessId}`, { params })
}

export const availabilityService = {
  list: (params = {}) => api.get('/availability', { params }),
  get: (id) => api.get(`/availability/${id}`),
  create: (data) => api.post('/availability', data),
  update: (id, data) => api.put(`/availability/${id}`, data),
  remove: (id) => api.delete(`/availability/${id}`),
  staff: (staffId, params = {}) => api.get(`/availability/staff/${staffId}`, { params })
}
