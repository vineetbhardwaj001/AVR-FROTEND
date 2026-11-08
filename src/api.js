const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'aivoice-token';
const USER_KEY = 'aivoice-user';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) { super(message); this.name = 'ApiError'; this.status = status; this.details = details; }
}
export function getSession() {
  try { const token = sessionStorage.getItem(TOKEN_KEY); const user = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); return token && user ? { token, user } : null; } catch { return null; }
}
export function saveSession(token, user) {
  if (!token || !user) throw new ApiError('The server returned an incomplete login response.');
  sessionStorage.setItem(TOKEN_KEY, token); sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); }
export async function request(path, { method = 'GET', body, query, auth = true, signal } = {}) {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value)); });
  const headers = { Accept: 'application/json' }; if (body !== undefined) headers['Content-Type'] = 'application/json';
  const session = getSession(); if (auth && session?.token) headers.Authorization = `Bearer ${session.token}`;
  let response;
  try { response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new ApiError('Unable to reach the server. Check your connection and API URL.'); }
  let payload = null; try { payload = await response.json(); } catch {}
  if (response.status === 401 && auth) { clearSession(); window.dispatchEvent(new CustomEvent('aivoice:unauthorized')); }
  if (!response.ok || payload?.success === false) throw new ApiError(payload?.message || `Request failed (${response.status}).`, response.status, payload);
  return payload?.data !== undefined ? payload.data : payload;
}
export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', auth: false, body: { email, password } }),
  me: () => request('/auth/me'),
  list: (resource, query = {}) => request(`/${resource}`, { query: { page: 1, limit: 50, ...query } }),
  get: (resource, id) => request(`/${resource}/${encodeURIComponent(id)}`),
  create: (resource, body) => request(`/${resource}`, { method: 'POST', body }),
  update: (resource, id, body) => request(`/${resource}/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  remove: (resource, id) => request(`/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  onboardBusiness: (body) => request('/admin/businesses', { method: 'POST', body }),
  staffAvailability: () => request('/staff/me/availability'),
};
