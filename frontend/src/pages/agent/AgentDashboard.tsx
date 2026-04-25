import AgentDocuments from './AgentDocuments'
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AgentDashboard() {
  const [stats, setStats] = useState({ pending: 0, validated: 0, rejected: 0 })
  const [refreshKey, setRefreshKey] = useState(0)


  useEffect(() => {
  const loadStats = async () => {
    try {
      const res = await api.get('/agent/stats')
      setStats(res.data.data || res.data || {
        pending: 0,
        validated: 0,
        rejected: 0
      })
    } catch (e) {
      console.error('Erreur stats agent', e)
    }
  }

  loadStats()
}, [refreshKey])

  const handleDocumentProcessed = () => {
    // Recharger les stats quand un document est traité
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Espace Agent</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-yellow-600">En attente</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-700">{stats.validated}</p>
          <p className="text-sm text-green-600">Validés</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          <p className="text-sm text-red-600">Rejetés</p>
        </div>
      </div>

      <AgentDocuments onDocumentProcessed={handleDocumentProcessed} />
    </div>
  )
}
