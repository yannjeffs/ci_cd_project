import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import ConcoursSelector from '../components/ConcoursSelector'
import { useEnrollement } from '../contexts/EnrollementContext'

interface Enrollement {
  id: number
  statut: 'EN_ATTENTE' | 'COMPLET' | 'VALIDE' | 'REJETE'
  date_enrolement: string
  annee_academique: string
  filiere?: { nom: string }
  niveau?: { nom: string }
  centreDepot?: { nom: string }
}

interface Etudiant {
  id: number
  matricule: string
  filiere?: { nom: string }
  niveau?: { nom: string }
}

export default function Enrollement() {
  const { user } = useAuth()
  const { activeEnrollement } = useEnrollement()
  const [enrollement, setEnrollement] = useState<Enrollement | null>(null)
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeEnrollement]) // Reload when active enrollement changes

  const loadData = async () => {
    try {
      const meRes = await api.get('/me')
      setEtudiant(meRes.data.etudiant)

      const enrollRes = await api.get('/my-enrollement')
      setEnrollement(enrollRes.data.data)
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFiche = async () => {
    if (!enrollement) return
    setDownloading(true)
    try {
      const response = await api.get(`/enrollements/${enrollement.id}/pdf`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Fiche_Enrollement_${etudiant?.matricule}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement:', err)
      alert('Erreur lors du téléchargement de la fiche')
    } finally {
      setDownloading(false)
    }
  }

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          label: 'Enrôlement Validé',
          icon: '🎓',
          linear: 'from-emerald-400 to-teal-500',
          bg: 'from-emerald-50/50 to-teal-50/50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          herolinear: 'from-emerald-500/20 via-teal-500/20 to-green-500/20'
        }
      case 'REJETE':
        return {
          label: 'Enrôlement Rejeté',
          icon: '❌',
          linear: 'from-rose-400 to-red-500',
          bg: 'from-rose-50/50 to-red-50/50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          herolinear: 'from-rose-500/20 via-red-500/20 to-pink-500/20'
        }
      case 'COMPLET':
        return {
          label: 'Dossier Complet',
          icon: '📋',
          linear: 'from-blue-400 to-indigo-500',
          bg: 'from-blue-50/50 to-indigo-50/50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          herolinear: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20'
        }
      default:
        return {
          label: 'En attente',
          icon: '⏳',
          linear: 'from-amber-400 to-orange-500',
          bg: 'from-amber-50/50 to-orange-50/50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          herolinear: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30">
        <div className="text-center">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 border-4 border-blue-100/50 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-600/80 font-semibold text-lg">Chargement de votre enrôlement...</p>
        </div>
      </div>
    )
  }

  // Pas d'enrôlement
  if (!enrollement) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Concours Selector */}
          <div className="mb-8">
            <ConcoursSelector />
          </div>

          {/* Hero Section */}
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-sky-400/20 to-indigo-400/20 rounded-[2.5rem] blur-3xl"></div>
            <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-200/20 to-transparent rounded-full -mr-48 -mt-48"></div>
              
              <div className="relative p-10 text-center">
                <div className="w-32 h-32 bg-linear-to-br from-blue-100/50 to-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/50">
                  <span className="text-7xl">📋</span>
                </div>
                
                <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                  Mon Enrôlement
                </h1>
                
                <p className="text-xl text-slate-600/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Pas encore d'enrôlement actif
                </p>

                <div className="bg-linear-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/50 max-w-2xl mx-auto">
                  <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                    Votre enrôlement sera automatiquement créé une fois que votre paiement aura été validé par l'administration.
                  </p>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
                    <h3 className="font-black text-blue-700 mb-6 text-xl flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Parcours d'inscription
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { step: '1', label: 'Compléter votre profil', status: 'done', icon: '✓' },
                        { step: '2', label: 'Téléverser tous les documents requis', status: 'done', icon: '✓' },
                        { step: '3', label: 'Soumettre votre paiement', status: 'done', icon: '✓' },
                        { step: '4', label: 'Attendre la validation par l\'admin', status: 'pending', icon: '⏳' },
                        { step: '5', label: 'Télécharger votre fiche d\'enrôlement', status: 'upcoming', icon: '📄' }
                      ].map((item) => (
                        <div
                          key={item.step}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                            item.status === 'done'
                              ? 'bg-emerald-50/80 border-2 border-emerald-200/50'
                              : item.status === 'pending'
                                ? 'bg-amber-50/80 border-2 border-amber-200/50'
                                : 'bg-slate-50/80 border-2 border-slate-200/50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${
                            item.status === 'done'
                              ? 'bg-linear-to-br from-emerald-400 to-teal-500'
                              : item.status === 'pending'
                                ? 'bg-linear-to-br from-amber-400 to-orange-500'
                                : 'bg-linear-to-br from-slate-300 to-slate-400'
                          }`}>
                            {item.status === 'done' ? item.icon : item.step}
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold ${
                              item.status === 'done'
                                ? 'text-emerald-700'
                                : item.status === 'pending'
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                            }`}>
                              {item.label}
                            </p>
                          </div>
                          {item.status === 'pending' && (
                            <div className="text-2xl animate-pulse">{item.icon}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(enrollement.statut)

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Concours Selector */}
        <div className="mb-8">
          <ConcoursSelector />
        </div>

        {/* Hero avec statut */}
        <div className="relative mb-10">
          <div className={`absolute inset-0 bg-linear-to-r ${statusConfig.herolinear} rounded-[2.5rem] blur-3xl`}></div>
          <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden">
            {/* Motifs décoratifs */}
            <div className={`absolute top-0 right-0 w-96 h-96 bg-linear-to-br ${statusConfig.linear} opacity-5 rounded-full -mr-48 -mt-48`}></div>
            <div className={`absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr ${statusConfig.linear} opacity-5 rounded-full -ml-40 -mb-40`}></div>
            
            <div className="relative p-10 text-center">
              <div className={`w-32 h-32 bg-linear-to-br ${statusConfig.linear} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-8 ring-white/30`}>
                <span className="text-6xl">{statusConfig.icon}</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-slate-800 mb-3 tracking-tight">
                {enrollement.statut === 'VALIDE' ? 'Félicitations !' :
                 enrollement.statut === 'REJETE' ? 'Enrôlement Rejeté' :
                 'Dossier en traitement'}
              </h1>
              
              <p className="text-xl text-slate-600/80 mb-6">
                {enrollement.statut === 'VALIDE' 
                  ? 'Votre enrôlement a été validé avec succès.'
                  : enrollement.statut === 'REJETE'
                    ? 'Votre dossier a été rejeté par l\'administration.'
                    : 'Votre dossier est actuellement en cours de vérification.'}
              </p>

              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-linear-to-r ${statusConfig.bg} backdrop-blur-sm border-2 ${statusConfig.border} shadow-lg`}>
                <div className={`w-3 h-3 rounded-full bg-linear-to-br ${statusConfig.linear} ${enrollement.statut === 'EN_ATTENTE' || enrollement.statut === 'COMPLET' ? 'animate-pulse' : ''}`}></div>
                <span className={`font-black text-lg ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Carte Étudiant */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Étudiant</h2>
            </div>
            
            <div className="space-y-4">
              <InfoItem
                label="Nom complet"
                value={`${user?.prenom} ${user?.nom}`}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <InfoItem
                label="Matricule"
                value={etudiant?.matricule || '-'}
                highlight
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
              <InfoItem
                label="Filière"
                value={enrollement.filiere?.nom || etudiant?.filiere?.nom || '-'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
              <InfoItem
                label="Niveau"
                value={enrollement.niveau?.nom || etudiant?.niveau?.nom || '-'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Carte Enrôlement */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 bg-linear-to-br ${statusConfig.linear} rounded-2xl flex items-center justify-center shadow-lg`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Enrôlement</h2>
            </div>
            
            <div className="space-y-4">
              <InfoItem
                label="Année académique"
                value={enrollement.annee_academique}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <InfoItem
                label="Date d'enrôlement"
                value={new Date(enrollement.date_enrolement).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              {enrollement.centreDepot && (
                <InfoItem
                  label="Centre de dépôt"
                  value={enrollement.centreDepot.nom}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions selon le statut */}
        {enrollement.statut === 'VALIDE' && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8">
            <div className="bg-linear-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl p-6 mb-6 border-2 border-emerald-200/50">
              <div className="flex items-center justify-center gap-3 text-emerald-700">
                <span className="text-3xl">🎉</span>
                <p className="font-bold text-lg">
                  Votre fiche d'enrôlement avec QR Code est prête !
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadFiche}
              disabled={downloading}
              className="group w-full flex items-center justify-center gap-4 px-8 py-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all font-black text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Téléchargement en cours...</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Télécharger ma fiche d'enrôlement (PDF)</span>
                </>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-3 text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm font-medium">
                Cette fiche contient un QR Code unique pour vérification
              </p>
            </div>
          </div>
        )}

        {enrollement.statut === 'REJETE' && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8">
            <div className="bg-linear-to-br from-rose-50/80 to-red-50/80 rounded-2xl p-8 border-2 border-rose-200/50 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-rose-700 mb-4">Dossier rejeté</h3>
              <p className="text-rose-600 text-lg leading-relaxed">
                Veuillez contacter l'administration pour plus d'informations sur le rejet de votre dossier.
              </p>
            </div>
          </div>
        )}

        {(enrollement.statut === 'EN_ATTENTE' || enrollement.statut === 'COMPLET') && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8">
            <div className="bg-linear-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-8 border-2 border-amber-200/50 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <span className="text-4xl">⏳</span>
              </div>
              <h3 className="text-2xl font-black text-amber-700 mb-4">Vérification en cours</h3>
              <p className="text-amber-600 text-lg leading-relaxed">
                Votre dossier est en cours de vérification. Vous recevrez une notification WhatsApp une fois validé.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  icon,
  highlight = false
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${
      highlight
        ? 'bg-linear-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/50'
        : 'bg-linear-to-r from-slate-50/80 to-blue-50/50 border-slate-200/50'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          highlight ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`font-bold truncate ${
        highlight ? 'text-blue-700 text-xl font-mono' : 'text-slate-800 text-lg'
      }`}>
        {value}
      </p>
    </div>
  )
}