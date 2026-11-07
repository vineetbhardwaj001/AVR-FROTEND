import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('avr_token') || null,
  user: JSON.parse(localStorage.getItem('avr_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('avr_token'),

  setAuth: (token, user) => {
    localStorage.setItem('avr_token', token)
    localStorage.setItem('avr_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  setUser: (user) => {
    localStorage.setItem('avr_user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('avr_token')
    localStorage.removeItem('avr_user')
    set({ token: null, user: null, isAuthenticated: false })
  }
}))

export default useAuthStore
