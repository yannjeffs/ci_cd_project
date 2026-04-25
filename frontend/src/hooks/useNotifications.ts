import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

interface Notification {
  id: number
  type: string
  titre: string
  message: string
  lue: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Charger uniquement le compteur (léger)
  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (error) {
      console.error('Erreur chargement compteur:', error)
    }
  }, [])

  // Charger les notifications complètes (lourd)
  const loadNotifications = useCallback(async (page = 1, perPage = 10) => {
    try {
      setLoading(true)
      const res = await api.get(`/notifications?page=${page}&per_page=${perPage}`)
      setNotifications(res.data.data)
      // Compter les non lues dans les notifications chargées
      const unread = res.data.data.filter((n: Notification) => !n.lue).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Marquer comme lu
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lue: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erreur marquage notification:', error)
    }
  }, [])

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error)
    }
  }, [])

  // Polling optimisé: uniquement le compteur toutes les 60s
  useEffect(() => {
    // 60s au lieu de 30s
    const interval = setInterval(loadUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [loadUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead
  }
}
