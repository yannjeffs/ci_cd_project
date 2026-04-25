import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ConcoursSelector from '../components/ConcoursSelector'
import { useEnrollement } from '../contexts/EnrollementContext'
import { AxiosError } from 'axios'

interface Document {
  id_document: number
  type_document: string
  fichier_path: string
  date_televersement: string
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
}

// Documents requis pour l'enrôlement
const REQUIRED_DOCUMENTS = [
  { value: 'ACTE_NAISSANCE', label: 'Acte de naissance', icon: '📄', description: 'Copie intégrale ou extrait' },
  { value: 'DIPLOME_BAC', label: 'Diplôme du BAC', icon: '🎓', description: 'Original ou copie certifiée' },
  { value: 'RELEVE_NOTES', label: 'Relevé de notes', icon: '📊', description: 'Bulletins de terminale' },
  { value: 'PHOTO_IDENTITE', label: 'Photo d\'identité', icon: '📷', description: 'Format 4x4, fond blanc' },
  { value: 'CNI', label: 'Carte nationale d\'identité', icon: '🪪', description: 'Recto-verso valide' },
]

export default function Documents() {
  const navigate = useNavigate()
  const { activeEnrollement } = useEnrollement()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const response = await api.get('/my-documents')
      setDocuments(response.data.data || [])
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  }, [loadDocuments,activeEnrollement])

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.type_document === type && doc.statut !== 'REJETE')
  }

  const allRequiredDocumentsUploaded = () => {
    return REQUIRED_DOCUMENTS.every(req => getDocumentForType(req.value))
  }

  const handleFileSelect = async (type: string, file: File) => {
    setError('')
    setSuccess('')
    setUploadingType(type)

    const formData = new FormData()
    formData.append('fichier', file)
    formData.append('type_document', type)

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess(`${REQUIRED_DOCUMENTS.find(d => d.value === type)?.label} téléversé avec succès !`)
      setTimeout(() => setSuccess(''), 3000)
      loadDocuments()
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erreur lors du téléversement')
      } else {
        setError('Erreur inconnue lors du téléversement')
      }
    } finally {
      setUploadingType(null)
    }
  }

  const getStatusInfo = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return { 
          color: 'emerald', 
          bg: 'from-emerald-50 to-teal-50', 
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Validé'
        }
      case 'REJETE':
        return { 
          color: 'rose', 
          bg: 'from-rose-50 to-red-50', 
          border: 'border-rose-300',
          text: 'text-rose-700',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Rejeté'
        }
      default:
        return { 
          color: 'amber', 
          bg: 'from-amber-50 to-yellow-50', 
          border: 'border-amber-300',
          text: 'text-amber-700',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          label: 'En attente'
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
          <p className="text-blue-600 font-medium">Chargement de vos documents...</p>
        </div>
      </div>
    )
  }

  const uploadedCount = REQUIRED_DOCUMENTS.filter(req => getDocumentForType(req.value)).length
  const canProceed = allRequiredDocumentsUploaded()
  const progressPercent = (uploadedCount / REQUIRED_DOCUMENTS.length) * 100

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 pb-12">
      {/* En-tête sticky */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ConcoursSelector />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero section */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100 p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dossier de Documents</h1>
                    <p className="text-slate-600 mt-1">Téléversez les documents requis pour votre inscription</p>
                  </div>
                </div>

                {/* Barre de progression circulaire */}
                <div className="mt-6 flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#dbeafe"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#linear)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800">{uploadedCount}/{REQUIRED_DOCUMENTS.length}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Progression globale</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {canProceed 
                        ? '✓ Tous les documents ont été téléversés' 
                        : `${REQUIRED_DOCUMENTS.length - uploadedCount} document${REQUIRED_DOCUMENTS.length - uploadedCount > 1 ? 's' : ''} restant${REQUIRED_DOCUMENTS.length - uploadedCount > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Statut visuel */}
              <div className="hidden lg:block">
                <div className={`w-32 h-32 rounded-2xl bg-linear-to-br ${
                  canProceed 
                    ? 'from-emerald-400 to-teal-500' 
                    : 'from-blue-400 to-indigo-500'
                } flex items-center justify-center shadow-lg`}>
                  {canProceed ? (
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages flash */}
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

        {success && (
          <div className="mb-6 bg-linear-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-emerald-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Layout avec sidebar et liste */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Liste des documents */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-5 sticky top-32">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Documents requis</h3>
              <div className="space-y-2">
                {REQUIRED_DOCUMENTS.map((doc) => {
                  const uploaded = getDocumentForType(doc.value)
                  const isSelected = selectedDoc === doc.value
                  
                  return (
                    <button
                      key={doc.value}
                      onClick={() => setSelectedDoc(doc.value)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-linear-to-r from-blue-400 to-indigo-500 text-white shadow-md'
                          : uploaded
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{doc.icon}</span>
                          <span className="text-xs font-medium truncate">{doc.label}</span>
                        </div>
                        {uploaded && (
                          <svg className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Zone principale - Upload des documents */}
          <div className="lg:col-span-3 space-y-5">
            {REQUIRED_DOCUMENTS.map((docType) => {
              const uploadedDoc = getDocumentForType(docType.value)
              const isUploading = uploadingType === docType.value
              const statusInfo = uploadedDoc ? getStatusInfo(uploadedDoc.statut) : null
              const isExpanded = !selectedDoc || selectedDoc === docType.value

              if (!isExpanded) return null

              return (
                <div 
                  key={docType.value}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 overflow-hidden transition-all hover:shadow-md"
                >
                  {/* En-tête du document */}
                  <div className={`p-6 border-b ${uploadedDoc ? 'border-blue-100' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                          uploadedDoc 
                            ? `bg-linear-to-br ${statusInfo?.bg}` 
                            : 'bg-slate-100'
                        }`}>
                          {docType.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg mb-1">{docType.label}</h3>
                          <p className="text-sm text-slate-600 mb-2">{docType.description}</p>
                          {uploadedDoc && (
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo?.text} ${statusInfo?.bg} border ${statusInfo?.border}`}>
                                {statusInfo?.icon}
                                <span className="text-xs font-semibold">{statusInfo?.label}</span>
                              </div>
                              <span className="text-xs text-slate-500">
                                • {new Date(uploadedDoc.date_televersement).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zone de contenu */}
                  <div className="p-6">
                    {uploadedDoc ? (
                      <div className="space-y-3">
                        <a
                          href={`http://localhost:8000/storage/${uploadedDoc.fichier_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-sm hover:shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Visualiser le document
                        </a>
                        
                        {uploadedDoc.statut === 'REJETE' && (
                          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-linear-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all font-medium cursor-pointer shadow-sm hover:shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Remplacer le document
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileSelect(docType.value, e.target.files[0])
                                }
                              }}
                              disabled={isUploading}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className={`block cursor-pointer group ${isUploading ? 'pointer-events-none' : ''}`}>
                        <div className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
                          isUploading 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 group-hover:scale-[1.01]'
                        }`}>
                          {isUploading ? (
                            <div className="flex flex-col items-center">
                              <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                              <p className="text-blue-700 font-medium mb-1">Téléversement en cours...</p>
                              <p className="text-blue-600 text-sm">Veuillez patienter</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <p className="text-slate-800 font-semibold mb-2 text-lg">Déposez votre fichier ici</p>
                              <p className="text-slate-600 text-sm mb-1">ou cliquez pour parcourir</p>
                              <p className="text-slate-500 text-xs mt-3">
                                Formats acceptés : PDF, JPG, PNG • Taille max : 10 MB
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelect(docType.value, e.target.files[0])
                            }
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer avec action */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              {canProceed ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 text-lg">Dossier complet !</h3>
                    <p className="text-emerald-600 text-sm">Vous pouvez passer à l'étape suivante</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 text-lg">Documents manquants</h3>
                    <p className="text-amber-600 text-sm">Téléversez tous les documents pour continuer</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/paiement')}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm ${
                canProceed 
                  ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Étape suivante : Paiement
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}