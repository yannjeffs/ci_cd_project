import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ConcoursSelector from '../components/ConcoursSelector'
import { useEnrollement } from '../contexts/EnrollementContext'

// Documents requis pour l'enrôlement
const REQUIRED_DOCUMENTS = ['ACTE_NAISSANCE', 'DIPLOME_BAC', 'RELEVE_NOTES', 'PHOTO_IDENTITE', 'CNI']

interface Document {
  id_document: number
  type_document: string
  statut: string
}

interface Paiement {
  id: number
  statut: string
}

interface Enrollement {
  id: number
  statut: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const { activeEnrollement } = useEnrollement()
  const [documents, setDocuments] = useState<Document[]>([])
  const [paiement, setPaiement] = useState<Paiement | null>(null)
  const [enrollement, setEnrollement] = useState<Enrollement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [activeEnrollement])

  const loadProgress = async () => {
    try {
      // Charger les documents
      try {
        const docsRes = await api.get('/my-documents')
        setDocuments(docsRes.data.data || [])
      } catch {
        setDocuments([])
      }

      // Charger le paiement
      try {
        const paiementRes = await api.get('/my-paiement')
        setPaiement(paiementRes.data.data)
      } catch {
        setPaiement(null)
      }

      // Charger l'enrôlement
      try {
        const enrollRes = await api.get('/my-enrollement')
        setEnrollement(enrollRes.data.data)
      } catch {
        setEnrollement(null)
      }
    } catch (err) {
      console.error('Erreur chargement progression:', err)
    } finally {
      setLoading(false)
    }
  }

  // Vérifier si tous les documents requis sont téléversés (non rejetés)
  const allDocumentsComplete = () => {
    return REQUIRED_DOCUMENTS.every(reqType => 
      documents.some(doc => doc.type_document === reqType && doc.statut !== 'REJETE')
    )
  }

  // Vérifier si le paiement est validé ou en attente
  const hasPaiement = () => {
    return paiement && (paiement.statut === 'VALIDE' || paiement.statut === 'EN_ATTENTE')
  }

  // Vérifier si le paiement est validé
  const isPaiementValide = () => {
    return paiement && paiement.statut === 'VALIDE'
  }

  // Vérifier si l'enrôlement est fait
  const hasEnrollement = () => {
    return enrollement && enrollement.statut !== 'REJETE'
  }

  const steps = [
    { 
      step: 1, 
      label: 'Profil Étudiant', 
      done: !!user?.etudiant, 
      link: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Renseignez vos informations personnelles',
      progress: user?.etudiant ? 100 : 0
    },
    { 
      step: 2, 
      label: 'Dépôt de Documents', 
      done: allDocumentsComplete(), 
      link: '/documents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Téléversez tous vos documents officiels',
      progress: Math.round((documents.filter(d => d.statut !== 'REJETE').length / REQUIRED_DOCUMENTS.length) * 100) || 0
    },
    { 
      step: 3, 
      label: 'Paiement', 
      done: hasPaiement(), 
      link: '/paiement',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Effectuez le paiement des frais d\'inscription',
      progress: isPaiementValide() ? 100 : hasPaiement() ? 50 : 0
    },
    { 
      step: 4, 
      label: 'Enrôlement Final', 
      done: hasEnrollement(), 
      link: '/enrollement',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: 'Finalisez votre inscription et obtenez votre fiche',
      progress: hasEnrollement() ? 100 : 0
    },
  ]

  // Déterminer l'étape actuelle
  const getCurrentStep = () => {
    if (!user?.etudiant) return 1
    if (!allDocumentsComplete()) return 2
    if (!hasPaiement()) return 3
    if (!hasEnrollement()) return 4
    return 5
  }

  const currentStep = getCurrentStep()
  const completedSteps = steps.filter(s => s.done).length
  const totalProgress = Math.round((completedSteps / steps.length) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-600 font-medium text-lg">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 pb-12">
      {/* En-tête avec sélecteur de concours */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ConcoursSelector />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Carte de bienvenue */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-lg p-8 mb-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Bonjour {user?.prenom} !
                </h1>
                <p className="text-blue-100 text-lg">
                  Bienvenue sur votre espace d'inscription
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold">{totalProgress}%</div>
                  <div className="text-sm text-blue-100 mt-1">Progression totale</div>
                </div>
              </div>
            </div>
            
            {/* Barre de progression globale */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Votre avancement</span>
                <span className="text-blue-100">{completedSteps} / {steps.length} étapes</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-yellow-300 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline verticale des étapes */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Parcours d'inscription
              </h2>

              <div className="space-y-6">
                {steps.map((item, index) => {
                  const isActive = currentStep === item.step
                  const isAccessible = index === 0 || steps[index - 1].done
                  
                  return (
                    <div key={item.step} className="relative">
                      {/* Ligne de connexion */}
                      {index < steps.length - 1 && (
                        <div className="absolute left-6.75 top-15 w-0.5 h-[calc(100%+24px)] bg-linear-to-b from-blue-300 to-blue-100"></div>
                      )}
                      
                      <Link 
                        to={item.link}
                        className={`block ${!isAccessible ? 'pointer-events-none' : ''}`}
                      >
                        <div className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                          isActive 
                            ? 'border-blue-400 shadow-lg shadow-blue-100 scale-[1.02]' 
                            : item.done
                              ? 'border-emerald-300 hover:border-emerald-400 hover:shadow-md'
                              : isAccessible
                                ? 'border-blue-200 hover:border-blue-300 hover:shadow-md'
                                : 'border-slate-200 opacity-60'
                        }`}>
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Icône */}
                              <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                                item.done
                                  ? 'bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg'
                                  : isActive
                                    ? 'bg-linear-to-br from-blue-400 to-indigo-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-400'
                              }`}>
                                {item.done ? (
                                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  item.icon
                                )}
                              </div>

                              {/* Contenu */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className={`font-bold text-lg ${
                                    item.done ? 'text-emerald-700' : isActive ? 'text-blue-700' : 'text-slate-700'
                                  }`}>
                                    {item.label}
                                  </h3>
                                  {isActive && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                      En cours
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-slate-600 text-sm mb-3">
                                  {item.description}
                                </p>

                                {/* Barre de progression */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Progression</span>
                                    <span className={`font-semibold ${
                                      item.done ? 'text-emerald-600' : 'text-blue-600'
                                    }`}>
                                      {item.progress}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        item.done 
                                          ? 'bg-linear-to-r from-emerald-400 to-emerald-500' 
                                          : 'bg-linear-to-r from-blue-400 to-indigo-500'
                                      }`}
                                      style={{ width: `${item.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* Flèche */}
                              {isAccessible && (
                                <div className="shrink-0">
                                  <svg className={`w-6 h-6 ${item.done ? 'text-emerald-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Panneau latéral - Informations et statuts */}
          <div className="space-y-6">
            {/* Statut global */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Statut de votre dossier
              </h3>
              
              {currentStep === 5 ? (
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-800">Inscription complète</div>
                      <div className="text-xs text-emerald-600">Dossier validé</div>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700 mt-2">
                    Félicitations ! Votre inscription est finalisée. Vous pouvez consulter votre fiche d'enrôlement.
                  </p>
                </div>
              ) : (
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-blue-800">En cours d'inscription</div>
                      <div className="text-xs text-blue-600">Étape {currentStep}/4</div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {currentStep === 1 && "Complétez votre profil pour continuer."}
                    {currentStep === 2 && "Téléversez tous les documents requis."}
                    {currentStep === 3 && "Effectuez le paiement des frais d'inscription."}
                    {currentStep === 4 && "Finalisez votre enrôlement."}
                  </p>
                </div>
              )}
            </div>

            {/* Détails des étapes */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Détails
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Documents déposés</span>
                  <span className="font-semibold text-slate-800">
                    {documents.filter(d => d.statut !== 'REJETE').length} / {REQUIRED_DOCUMENTS.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Paiement</span>
                  <span className={`font-semibold ${
                    isPaiementValide() ? 'text-emerald-600' : hasPaiement() ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {isPaiementValide() ? 'Validé' : hasPaiement() ? 'En attente' : 'Non effectué'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Enrôlement</span>
                  <span className={`font-semibold ${hasEnrollement() ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasEnrollement() ? 'Complété' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Aide */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">Besoin d'aide ?</h4>
                  <p className="text-sm text-amber-700">
                    Consultez notre guide ou contactez le support pour toute question.
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