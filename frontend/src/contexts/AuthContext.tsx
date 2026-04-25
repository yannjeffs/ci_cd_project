import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '../services/api'

interface Role {
  id: number
  nom_role: string
}

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role?: Role
  etudiant?: Record<string, unknown>
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

interface RegisterData {
  nom: string
  prenom: string
  email: string
  telephone: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour obtenir la clé de stockage basée sur le rôle
  const getStorageKey = (role?: string) => {
    if (role === 'ADMIN') return 'token_admin'
    if (role === 'AGENT_DOCUMENTS') return 'token_agent'
    if (role === 'ETUDIANT') return 'token_etudiant'
    return 'token' // Fallback
  }

  const fetchUser = useCallback(async (authToken?: string) => {
    try {
      const response = await api.get('/me', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      })
      setUser(response.data)
      
      // Sauvegarder le token avec la bonne clé selon le rôle
      if (authToken && response.data.role) {
        const storageKey = getStorageKey(response.data.role.nom_role)
        localStorage.setItem(storageKey, authToken)
        // Nettoyer l'ancien token générique si présent
        if (storageKey !== 'token') {
          localStorage.removeItem('token')
        }
      }
    } catch {
      // Nettoyer tous les tokens en cas d'erreur
      localStorage.removeItem('token')
      localStorage.removeItem('token_etudiant')
      localStorage.removeItem('token_agent')
      localStorage.removeItem('token_admin')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger le token au démarrage
  useEffect(() => {
    // Essayer de charger un token existant (dans l'ordre de priorité)
    const tokenEtudiant = localStorage.getItem('token_etudiant')
    const tokenAgent = localStorage.getItem('token_agent')
    const tokenAdmin = localStorage.getItem('token_admin')
    const tokenDefault = localStorage.getItem('token')

    const existingToken = tokenEtudiant || tokenAgent || tokenAdmin || tokenDefault
    
    if (existingToken) {
      setToken(existingToken)
      fetchUser(existingToken)
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password })
    const { token: newToken, user: userData } = response.data
    
    // Sauvegarder avec la clé appropriée selon le rôle
    const storageKey = getStorageKey(userData.role?.nom_role)
    localStorage.setItem(storageKey, newToken)
    
    setToken(newToken)
    setUser(userData)
  }

  const register = async (data: RegisterData) => {
    const response = await api.post('/register', data)
    const { token: newToken, user: userData } = response.data
    
    // Sauvegarder avec la clé appropriée selon le rôle
    const storageKey = getStorageKey(userData.role?.nom_role)
    localStorage.setItem(storageKey, newToken)
    
    setToken(newToken)
    setUser(userData)
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } finally {
      // Supprimer uniquement le token de l'utilisateur actuel
      if (user?.role) {
        const storageKey = getStorageKey(user.role.nom_role)
        localStorage.removeItem(storageKey)
      }
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
