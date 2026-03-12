import { useState, useEffect } from 'react'
import api from '../services/api'

interface Notification {
    id: number
    type: string
    titre: string
    message: string
    lu: boolean
    created_at: string
    data?: any
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        try {
            const response = await api.get('/notifications')
            setNotifications(response.data.data.data || response.data.data || [])
        } catch (error) {
            console.error('Erreur chargement notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`)
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, lu: true } : n
            ))
        } catch (error) {
            console.error('Erreur marquage notification:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all')
            setNotifications(notifications.map(n => ({ ...n, lu: true })))
        } catch (error) {
            console.error('Erreur marquage toutes notifications:', error)
        }
    }

    const deleteNotification = async (id: number) => {
        if (!confirm('Supprimer cette notification ?')) return
        try {
            await api.delete(`/notifications/${id}`)
            setNotifications(notifications.filter(n => n.id !== id))
        } catch (error) {
            console.error('Erreur suppression notification:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'DOCUMENTS_VALIDES':
                return '✅'
            case 'DOCUMENT_VALIDE':
                return '📄'
            case 'DOCUMENT_REJETE':
                return '❌'
            case 'PAIEMENT_VALIDE':
                return '💰'
            case 'PAIEMENT_REJETE':
                return '⚠️'
            default:
                return '🔔'
        }
    }

    const getNotificationColor = (type: string) => {
        if (type.includes('VALIDE')) return 'bg-green-50 border-green-200'
        if (type.includes('REJETE')) return 'bg-red-50 border-red-200'
        return 'bg-blue-50 border-blue-200'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.lu)
        : notifications

    const unreadCount = notifications.filter(n => !n.lu).length

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes vos notifications sont lues'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Toutes ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Non lues ({unreadCount})
                </button>
            </div>

            {/* Liste des notifications */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <p className="text-gray-500 text-lg">Aucune notification</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all ${getNotificationColor(notif.type)
                                } ${!notif.lu ? 'shadow-md' : ''}`}
                        >
                            <div className="p-5">
                                <div className="flex gap-4">
                                    {/* Icône */}
                                    <div className="text-3xl flex-shrink-0">
                                        {getNotificationIcon(notif.type)}
                                    </div>

                                    {/* Contenu */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                                                    {notif.titre}
                                                    {!notif.lu && (
                                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-700 mt-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-3">
                                                    📅 {formatDate(notif.created_at)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {!notif.lu && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Marquer comme lu"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
