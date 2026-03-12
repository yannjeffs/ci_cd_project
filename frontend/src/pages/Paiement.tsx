import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import ConcoursSelector from '../components/ConcoursSelector'
import { useEnrollement } from '../contexts/EnrollementContext'

interface Etudiant {
  id: number
  matricule: string
  filiere?: { nom: string }
  niveau?: { nom: string }
}

interface PaiementData {
  id_paiement: number
  montant: string
  mode_paiement: string
  date_paiement: string
  reference_transaction: string | null
  preuve_paiement: string | null
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
  motif_rejet: string | null
  created_at: string
}

const MODES_PAIEMENT = [
  { value: 'Orange Money', label: 'Orange Money', icon: '🟠', color: 'from-orange-400 to-orange-500' },
  { value: 'MTN Mobile Money', label: 'MTN Mobile Money', icon: '🟡', color: 'from-yellow-400 to-amber-500' },
  { value: 'Virement', label: 'Virement bancaire', icon: '🏦', color: 'from-blue-400 to-indigo-500' },
  { value: 'Espèces', label: 'Espèces (au guichet)', icon: '💵', color: 'from-emerald-400 to-teal-500' },
]

const FRAIS_INSCRIPTION = 50000

export default function Paiement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { activeEnrollement } = useEnrollement()
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null)
  const [paiement, setPaiement] = useState<PaiementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [, setSuccess] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    mode_paiement: '',
    reference_transaction: '',
    date_paiement: new Date().toISOString().split('T')[0],
  })
  const [preuveFichier, setPreuveFichier] = useState<File | null>(null)

  useEffect(() => {
    loadData()
    
    let pollInterval = 10000
    let timeoutId: ReturnType<typeof setTimeout>
    
    const poll = () => {
      if (paiement && paiement.statut === 'EN_ATTENTE') {
        loadData()
        pollInterval = Math.min(pollInterval * 1.2, 60000)
        timeoutId = setTimeout(poll, pollInterval)
      }
    }
    
    if (paiement && paiement.statut === 'EN_ATTENTE') {
      timeoutId = setTimeout(poll, pollInterval)
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [activeEnrollement, paiement?.statut])

  const loadData = async () => {
    try {
      const meRes = await api.get('/me')
      setEtudiant(meRes.data.etudiant)

      const concoursId = activeEnrollement?.concours_id || localStorage.getItem('active_concours_id')
      
      const paiementRes = await api.get('/my-paiement', {
        params: concoursId ? { concours_id: concoursId } : {}
      })
      
      setPaiement(paiementRes.data.data)
    } catch (err) {
      console.error('Erreur chargement données:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreuveFichier(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!preuveFichier) {
      setError('Veuillez téléverser la preuve de paiement (scan du reçu bancaire)')
      return
    }

    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('montant', FRAIS_INSCRIPTION.toString())
      formDataToSend.append('mode_paiement', formData.mode_paiement)
      formDataToSend.append('date_paiement', formData.date_paiement)
      if (formData.reference_transaction) {
        formDataToSend.append('reference_transaction', formData.reference_transaction)
      }
      formDataToSend.append('preuve_paiement', preuveFichier)

      const response = await api.post('/paiements/submit', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Paiement soumis avec succès ! En attente de validation.')
      setPaiement(response.data.paiement)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du paiement')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          linear: 'from-emerald-400 to-teal-500',
          bg: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Paiement Validé',
          message: 'Votre paiement a été validé avec succès. Vous pouvez maintenant finaliser votre enrôlement.'
        }
      case 'REJETE':
        return {
          linear: 'from-rose-400 to-red-500',
          bg: 'from-rose-50 to-red-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Paiement Rejeté',
          message: 'Votre paiement a été rejeté. Veuillez soumettre un nouveau paiement.'
        }
      default:
        return {
          linear: 'from-amber-400 to-orange-500',
          bg: 'from-amber-50 to-orange-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          icon: (
            <svg className="w-8 h-8 animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Vérification en Cours',
          message: 'Votre paiement est en cours de vérification par nos services. Cela peut prendre quelques minutes.'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-600 font-medium">Chargement des informations de paiement...</p>
        </div>
      </div>
    )
  }

  // Vue détaillée du paiement existant
  if (paiement) {
    const statusConfig = getStatusConfig(paiement.statut)
    
    return (
      <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 pb-12">
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20 mb-8">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <ConcoursSelector />
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl text-slate-700 hover:bg-blue-50 transition-all"
              title="Rafraîchir"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          {/* Hero card avec statut */}
          <div className={`bg-linear-to-r ${statusConfig.linear} rounded-3xl shadow-lg p-8 mb-8 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    {statusConfig.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{statusConfig.title}</h1>
                    <p className="text-white/90 mt-1">Dossier de paiement</p>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-white/95">{statusConfig.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte identité */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations de l'étudiant
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Nom complet</div>
                    <div className="font-semibold text-slate-800">{user?.prenom} {user?.nom}</div>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="text-xs text-blue-600 mb-1">Matricule</div>
                    <div className="font-bold text-blue-700 font-mono text-lg">{etudiant?.matricule}</div>
                  </div>
                </div>
              </div>

              {/* Détails du paiement */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="bg-linear-to-r from-slate-50 to-blue-50 border-b border-blue-100 px-6 py-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Détails du paiement
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Montant</div>
                        <div className="font-bold text-slate-800 text-lg">
                          {parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-600">Mode de paiement</div>
                    <div className="font-semibold text-slate-800">{paiement.mode_paiement}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-600">Date de paiement</div>
                    <div className="font-semibold text-slate-800">
                      {new Date(paiement.date_paiement).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {paiement.reference_transaction && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600">Référence</div>
                      <div className="font-mono text-slate-800 text-sm">{paiement.reference_transaction}</div>
                    </div>
                  )}

                  {paiement.preuve_paiement && (
                    <a
                      href={`http://localhost:8000/storage/${paiement.preuve_paiement}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full p-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir la preuve de paiement
                    </a>
                  )}
                </div>
              </div>

              {/* Motif de rejet si applicable */}
              {paiement.statut === 'REJETE' && paiement.motif_rejet && (
                <div className={`bg-linear-to-br ${statusConfig.bg} border ${statusConfig.border} rounded-2xl p-6`}>
                  <h3 className={`font-bold ${statusConfig.text} mb-2 flex items-center gap-2`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Motif du rejet
                  </h3>
                  <p className={`${statusConfig.text}`}>{paiement.motif_rejet}</p>
                </div>
              )}
            </div>

            {/* Sidebar actions */}
            <div className="space-y-6">
              {/* Statut badge */}
              <div className={`bg-linear-to-br ${statusConfig.bg} border ${statusConfig.border} rounded-2xl p-6 text-center`}>
                <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${statusConfig.linear} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {statusConfig.icon}
                </div>
                <h3 className={`font-bold ${statusConfig.text} text-lg mb-2`}>
                  {statusConfig.title}
                </h3>
                <p className={`text-sm ${statusConfig.text}`}>
                  {paiement.statut === 'EN_ATTENTE' && 'Vérification automatique toutes les 10 secondes'}
                  {paiement.statut === 'VALIDE' && 'Vous pouvez continuer'}
                  {paiement.statut === 'REJETE' && 'Action requise'}
                </p>
              </div>

              {/* Actions */}
              {paiement.statut === 'VALIDE' && (
                <button
                  onClick={() => navigate('/enrollement')}
                  className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Finaliser l'enrôlement
                </button>
              )}

              {paiement.statut === 'REJETE' && (
                <button
                  onClick={() => setPaiement(null)}
                  className="w-full py-4 bg-linear-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Nouveau paiement
                </button>
              )}

              {/* Info complémentaire */}
              <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">Information</h4>
                    <p className="text-xs text-blue-700">
                      Le délai de vérification est généralement de 24 à 48 heures ouvrables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulaire wizard de paiement
  const selectedMode = MODES_PAIEMENT.find(m => m.value === formData.mode_paiement)

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 pb-12">
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <ConcoursSelector />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Hero section */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Paiement des Frais d'Inscription</h1>
                <p className="text-blue-100 mt-1">Année académique 2025-2026</p>
              </div>
            </div>
            
            <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <span className="text-white/90 text-lg">Montant à payer :</span>
              <span className="text-3xl font-bold">{FRAIS_INSCRIPTION.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between relative">
              {/* Ligne de progression */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200">
                <div 
                  className="h-full bg-linear-to-r from-blue-400 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
              </div>

              {[
                { num: 1, label: 'Choix du mode', icon: '💳' },
                { num: 2, label: 'Informations', icon: '📝' },
                { num: 3, label: 'Confirmation', icon: '✓' }
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep >= step.num
                      ? 'bg-linear-to-br from-blue-400 to-indigo-500 text-white shadow-lg scale-110'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep >= step.num ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-linear-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-rose-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1 : Mode de paiement */}
          {currentStep === 1 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Choisissez votre mode de paiement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODES_PAIEMENT.map((mode) => (
                  <label
                    key={mode.value}
                    className={`relative cursor-pointer group`}
                  >
                    <input
                      type="radio"
                      name="mode_paiement"
                      value={mode.value}
                      checked={formData.mode_paiement === mode.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-6 rounded-2xl border-2 transition-all ${
                      formData.mode_paiement === mode.value
                        ? 'border-blue-400 bg-linear-to-br from-blue-50 to-indigo-50 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${mode.color} flex items-center justify-center text-3xl shadow-md`}>
                          {mode.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{mode.label}</div>
                          {formData.mode_paiement === mode.value && (
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Sélectionné
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (formData.mode_paiement) setCurrentStep(2)
                  else setError('Veuillez choisir un mode de paiement')
                }}
                disabled={!formData.mode_paiement}
                className="mt-6 w-full py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                Continuer
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {/* Étape 2 : Informations */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Info étudiant */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Vos informations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Nom complet</div>
                    <div className="font-semibold text-slate-800">{user?.prenom} {user?.nom}</div>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="text-xs text-blue-600 mb-1">Matricule</div>
                    <div className="font-bold text-blue-700 font-mono">{etudiant?.matricule}</div>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date de paiement
                  </label>
                  <input
                    type="date"
                    name="date_paiement"
                    value={formData.date_paiement}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Référence de transaction (optionnel)
                  </label>
                  <input
                    type="text"
                    name="reference_transaction"
                    value={formData.reference_transaction}
                    onChange={handleChange}
                    placeholder="Ex: TXN123456789"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-2">Code reçu après votre transaction</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preuve de paiement * (Reçu bancaire)
                  </label>
                  <label className={`block cursor-pointer group ${preuveFichier ? '' : 'hover:scale-[1.01]'} transition-transform`}>
                    <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all ${
                      preuveFichier 
                        ? 'border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50' 
                        : 'border-slate-300 group-hover:border-blue-400 group-hover:bg-blue-50/50'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {preuveFichier ? (
                        <div className="flex flex-col items-center text-emerald-700">
                          <svg className="w-16 h-16 mb-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="font-semibold mb-1">{preuveFichier.name}</p>
                          <p className="text-sm text-emerald-600">Cliquez pour changer de fichier</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-600">
                          <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="font-semibold mb-2">Déposez votre fichier ici</p>
                          <p className="text-sm text-slate-500">ou cliquez pour parcourir</p>
                          <p className="text-xs text-slate-400 mt-3">PDF, JPG, PNG • Max 10 MB</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (preuveFichier) setCurrentStep(3)
                    else setError('Veuillez téléverser la preuve de paiement')
                  }}
                  className="flex-1 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Vérifiez vos informations</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Mode de paiement</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedMode?.icon}</span>
                      <span className="font-semibold text-slate-800">{selectedMode?.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Montant</span>
                    <span className="font-bold text-slate-800 text-lg">{FRAIS_INSCRIPTION.toLocaleString('fr-FR')} FCFA</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(formData.date_paiement).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {formData.reference_transaction && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600">Référence</span>
                      <span className="font-mono text-slate-800">{formData.reference_transaction}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-700">Preuve de paiement</span>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">{preuveFichier?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <svg className="w-8 h-8 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-2">Rappel important</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Vérification sous 24-48h ouvrables</li>
                      <li>• Notifications par email et SMS</li>
                      <li>• Suivi en temps réel sur votre tableau de bord</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                  disabled={submitting}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirmer et soumettre
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}