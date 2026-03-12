import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Paiement {
  id_paiement: number
  montant: string
  mode_paiement: string
  date_paiement: string
  reference_transaction: string | null
  preuve_paiement: string | null
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
  motif_rejet: string | null
  created_at: string
  concours?: {
    id: number
    nom: string
    code: string
  }
  etudiant: {
    id: number
    matricule: string
    user: {
      nom: string
      prenom: string
      email: string
      telephone: string | null
    }
  }
}

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    loadPaiements()
  }, [])

  const loadPaiements = async () => {
    try {
      const response = await api.get('/paiements')
      setPaiements(response.data.data || response.data || [])
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id: number) => {
    if (!confirm('Confirmer la validation de ce paiement ?\n\nCela créera automatiquement l\'enrôlement de l\'étudiant et lui enverra une notification.')) return
    setProcessing(id)
    try {
      await api.post(`/paiements/${id}/valider`)
      alert('✅ Paiement validé et enrôlement créé avec succès !')
      loadPaiements()
    } catch (error: any) {
      console.error('Erreur validation:', error)
      const message = error.response?.data?.message || 'Erreur lors de la validation'
      alert(`❌ ${message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleRejeter = async (id: number) => {
    const motif = prompt('Motif du rejet (obligatoire pour informer l\'étudiant):')
    if (motif === null) return // Annulé
    if (!motif.trim()) {
      alert('Veuillez saisir un motif de rejet')
      return
    }
    setProcessing(id)
    try {
      await api.post(`/paiements/${id}/rejeter`, { motif_rejet: motif })
      alert('Paiement rejeté. L\'étudiant sera notifié.')
      loadPaiements()
    } catch (error) {
      console.error('Erreur rejet:', error)
      alert('Erreur lors du rejet')
    } finally {
      setProcessing(null)
    }
  }

  const filteredPaiements = paiements.filter(p => {
    if (filter === 'all') return true
    return p.statut === filter
  })

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-blue-700 rounded-full text-sm font-medium border border-emerald-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Validé
          </span>
        )
      case 'REJETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            En attente
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Chargement des paiements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec dégradé bleu doux */}
      <div className="bg-linear-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestion des Paiements</h1>
              <p className="text-slate-600 mt-1">Validez ou rejetez les paiements en attente</p>
            </div>
          </div>
          
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700 shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">Tous les paiements ({paiements.length})</option>
              <option value="EN_ATTENTE">⏳ En attente ({paiements.filter(p => p.statut === 'EN_ATTENTE').length})</option>
              <option value="VALIDE">✓ Validés ({paiements.filter(p => p.statut === 'VALIDE').length})</option>
              <option value="REJETE">✗ Rejetés ({paiements.filter(p => p.statut === 'REJETE').length})</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats rapides avec design moderne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="En attente"
          value={paiements.filter(p => p.statut === 'EN_ATTENTE').length}
          icon="⏳"
          gradient="from-amber-400 to-orange-500"
          bgColor="bg-gradient-to-br from-amber-50 to-orange-50"
          borderColor="border-amber-200"
        />
        <StatCard
          title="Validés"
          value={paiements.filter(p => p.statut === 'VALIDE').length}
          icon="✓"
          gradient="from-emerald-400 to-green-500"
          bgColor="bg-gradient-to-br from-emerald-50 to-green-50"
          borderColor="border-emerald-200"
        />
        <StatCard
          title="Rejetés"
          value={paiements.filter(p => p.statut === 'REJETE').length}
          icon="✗"
          gradient="from-red-400 to-rose-500"
          bgColor="bg-gradient-to-br from-red-50 to-rose-50"
          borderColor="border-red-200"
        />
      </div>

      {/* Liste des paiements avec design élégant */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {filteredPaiements.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-lg">Aucun paiement trouvé</p>
            <p className="text-slate-400 text-sm mt-2">Changez les filtres pour voir plus de résultats</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Étudiant</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Matricule</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Concours</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Montant</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Mode</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Preuve</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Statut</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPaiements.map((p) => (
                  <tr key={p.id_paiement} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                          {p.etudiant?.user?.prenom?.charAt(0)}{p.etudiant?.user?.nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {p.etudiant?.user?.nom} {p.etudiant?.user?.prenom}
                          </p>
                          <p className="text-sm text-slate-500">{p.etudiant?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        {p.etudiant?.matricule}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {p.concours ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-200">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          {p.concours.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Non spécifié</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-lg font-bold text-slate-800">
                        {parseFloat(p.montant).toLocaleString()}
                        <span className="text-sm font-normal text-slate-500 ml-1">FCFA</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {p.mode_paiement}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {new Date(p.date_paiement).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.preuve_paiement ? (
                        <a
                          href={`http://localhost:8000/storage/${p.preuve_paiement}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">Aucune preuve</span>
                      )}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(p.statut)}</td>
                    <td className="py-4 px-6">
                      {p.statut === 'EN_ATTENTE' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValider(p.id_paiement)}
                            disabled={processing === p.id_paiement}
                            className="group/btn relative px-4 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                          >
                            {processing === p.id_paiement ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Validation...
                              </span>
                            ) : (
                              'Valider'
                            )}
                          </button>
                          <button
                            onClick={() => handleRejeter(p.id_paiement)}
                            disabled={processing === p.id_paiement}
                            className="px-4 py-2 bg-linear-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                      {p.statut === 'REJETE' && p.motif_rejet && (
                        <div className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                          <span className="font-semibold">Motif:</span> {p.motif_rejet}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  bgColor,
  borderColor
}: {
  title: string
  value: number
  icon: string
  gradient: string
  bgColor: string
  borderColor: string
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 border-2 ${borderColor} shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-linear-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <span className="text-3xl">{icon}</span>
        </div>
        <div className={`text-4xl font-black bg-linear-to-br ${gradient} bg-clip-text text-transparent`}>
          {value}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</p>
    </div>
  )
}