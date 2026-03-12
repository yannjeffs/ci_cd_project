import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  // Chercher le token dans l'ordre de priorité
  const tokenEtudiant = localStorage.getItem('token_etudiant')
  const tokenAgent = localStorage.getItem('token_agent')
  const tokenAdmin = localStorage.getItem('token_admin')
  const tokenDefault = localStorage.getItem('token')
  
  const token = tokenEtudiant || tokenAgent || tokenAdmin || tokenDefault
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyer tous les tokens en cas d'erreur 401
      localStorage.removeItem('token')
      localStorage.removeItem('token_etudiant')
      localStorage.removeItem('token_agent')
      localStorage.removeItem('token_admin')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API functions
export const verifyEmail = (code: string, email: string) => 
  api.post('/email/verify', { code, email })

export const resendVerification = (email: string) => 
  api.post('/email/resend', { email })

export const forgotPassword = (email: string) => 
  api.post('/password/forgot', { email })

export const resetPassword = (data: {
  token: string
  email: string
  password: string
  password_confirmation: string
}) => api.post('/password/reset', data)

export default api
