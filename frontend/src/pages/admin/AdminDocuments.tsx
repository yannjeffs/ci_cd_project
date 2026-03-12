import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Document {
  id: number
  type: string
  statut: string
  date: string
  url: string
  concours_id?: number
  concours_nom?: string
  concours_code?: string
}

interface StudentDocuments {
  etudiant_id: number
  etudiant_nom: string
  etudiant_email: string
  statistiques: {
    total: number
    valides: number
    en_attente: number
    rejetes: number
  }
  documents: Document[]
}

const DOCUMENT_TYPES: Record<string, string> = {
  'ACTE_NAISSANCE': 'Acte de naissance',
  'DIPLOME_BAC': 'Diplôme du BAC',
  'RELEVE_NOTES': 'Relevé de notes',
  'PHOTO_IDENTITE': 'Photo d\'identité',
  'CNI': 'Carte nationale d\'identité',
  'CERTIFICAT_MEDICAL': 'Certificat médical',
  'AUTRE': 'Autre document',
}

export default function AdminDocuments() {
  const [studentsData, setStudentsData] = useState<StudentDocuments[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [processing, setProcessing] = useState<number | null>(null)
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents')
      setStudentsData(response.data.data || response.data || [])
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id: number) => {
    if (!confirm('Confirmer la validation de ce document ?')) return
    setProcessing(id)
    try {
      await api.patch(`/documents/${id}/valider`, { statut: 'VALIDE' })
      loadDocuments()
    } catch (error) {
      console.error('Erreur validation:', error)
      alert('Erreur lors de la validation')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejeter = async (id: number) => {
    if (!confirm('Confirmer le rejet de ce document ?')) return
    setProcessing(id)
    try {
      await api.patch(`/documents/${id}/valider`, { statut: 'REJETE' })
      loadDocuments()
    } catch (error) {
      console.error('Erreur rejet:', error)
      alert('Erreur lors du rejet')
    } finally {
      setProcessing(null)
    }
  }

  const handleValiderTous = async (etudiantId: number, etudiantNom: string) => {
    if (!confirm(`Valider TOUS les documents en attente de ${etudiantNom} ?`)) return
    setProcessing(etudiantId)
    try {
      const response = await api.post(`/documents/valider-tous/${etudiantId}`)
      alert(response.data.message)
      loadDocuments()
    } catch (error: any) {
      console.error('Erreur validation groupée:', error)
      alert(error.response?.data?.message || 'Erreur lors de la validation groupée')
    } finally {
      setProcessing(null)
    }
  }

  const toggleStudent = (etudiantId: number) => {
    const newExpanded = new Set(expandedStudents)
    if (newExpanded.has(etudiantId)) {
      newExpanded.delete(etudiantId)
    } else {
      newExpanded.add(etudiantId)
    }
    setExpandedStudents(newExpanded)
  }

  const filteredStudents = studentsData.filter(student => {
    if (filter === 'all') return true
    if (filter === 'EN_ATTENTE') return student.statistiques.en_attente > 0
    if (filter === 'VALIDE') return student.statistiques.valides > 0
    if (filter === 'REJETE') return student.statistiques.rejetes > 0
    return true
  })

  const totalStats = studentsData.reduce((acc, student) => ({
    total: acc.total + student.statistiques.total,
    valides: acc.valides + student.statistiques.valides,
    en_attente: acc.en_attente + student.statistiques.en_attente,
    rejetes: acc.rejetes + student.statistiques.rejetes,
  }), { total: 0, valides: 0, en_attente: 0, rejetes: 0 })

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Validé
          </span>
        )
      case 'REJETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            En attente
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-slate-700 font-semibold text-lg">Chargement des documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec design ondulé */}
      <div className="relative bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative px-8 py-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Gestion des Documents</h1>
                <p className="text-blue-100 text-lg font-medium">Validez les documents soumis par les étudiants</p>
              </div>
            </div>
            
            <div className="relative w-full lg:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full lg:w-auto appearance-none pl-5 pr-12 py-4 bg-white/95 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-2 focus:ring-white focus:border-white transition-all font-bold text-slate-700 shadow-lg cursor-pointer"
              >
                <option value="all">📊 Tous les étudiants ({filteredStudents.length})</option>
                <option value="EN_ATTENTE">⏳ Avec documents en attente</option>
                <option value="VALIDE">✅ Avec documents validés</option>
                <option value="REJETE">❌ Avec documents rejetés</option>
              </select>
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Forme ondulée en bas */}
        <svg className="absolute bottom-0 left-0 w-full h-6 text-white" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="currentColor">
          <path d="M0,0 C240,36 480,54 720,54 C960,54 1200,36 1440,0 L1440,54 L0,54 Z"></path>
        </svg>
      </div>

      {/* Statistiques avec nouveau layout en grille */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          label="Total Documents"
          value={totalStats.total}
          gradient="from-sky-400 to-blue-500"
          bgGradient="from-sky-50 to-blue-50"
        />
        <MetricCard
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="En Attente"
          value={totalStats.en_attente}
          gradient="from-amber-400 to-orange-500"
          bgGradient="from-amber-50 to-orange-50"
        />
        <MetricCard
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Validés"
          value={totalStats.valides}
          gradient="from-emerald-400 to-green-500"
          bgGradient="from-emerald-50 to-green-50"
        />
        <MetricCard
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Rejetés"
          value={totalStats.rejetes}
          gradient="from-red-400 to-rose-500"
          bgGradient="from-red-50 to-rose-50"
        />
      </div>

      {/* Liste des étudiants avec design carte */}
      <div className="space-y-5">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-linear-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Aucun étudiant trouvé</h3>
            <p className="text-slate-500">Modifiez les filtres pour afficher d'autres résultats</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.etudiant_id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
              {/* En-tête étudiant redessiné */}
              <div className="bg-linear-to-r from-slate-50 via-blue-50 to-indigo-50 p-6 border-b-2 border-blue-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {student.etudiant_nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{student.etudiant_nom}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {student.etudiant_email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-slate-200">
                      <span className="text-2xl font-black text-slate-800">{student.statistiques.total}</span>
                      <div className="text-xs">
                        <span className="text-amber-600 font-bold">{student.statistiques.en_attente}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-emerald-600 font-bold">{student.statistiques.valides}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-red-600 font-bold">{student.statistiques.rejetes}</span>
                      </div>
                    </div>
                    
                    {student.statistiques.en_attente > 0 && (
                      <button
                        onClick={() => handleValiderTous(student.etudiant_id, student.etudiant_nom)}
                        disabled={processing === student.etudiant_id}
                        className="group relative px-5 py-2.5 bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        {processing === student.etudiant_id ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validation...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Tout valider
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleStudent(student.etudiant_id)}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors border-2 border-slate-200 flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-sm">
                        {expandedStudents.has(student.etudiant_id) ? 'Masquer' : 'Détails'}
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedStudents.has(student.etudiant_id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grille de documents (au lieu de tableau) */}
              {expandedStudents.has(student.etudiant_id) && (
                <div className="p-6 bg-linear-to-br from-slate-50/50 to-blue-50/30">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {student.documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onValider={handleValider}
                        onRejeter={handleRejeter}
                        processing={processing}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  gradient,
  bgGradient
}: {
  icon: React.ReactNode
  label: string
  value: number
  gradient: string
  bgGradient: string
}) {
  return (
    <div className={`relative bg-linear-to-br ${bgGradient} rounded-2xl p-6 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}>
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
          <p className={`text-4xl font-black bg-linear-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function DocumentCard({
  document: doc,
  onValider,
  onRejeter,
  processing,
  getStatusBadge
}: {
  document: Document
  onValider: (id: number) => void
  onRejeter: (id: number) => void
  processing: number | null
  getStatusBadge: (statut: string) => React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all border border-slate-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{DOCUMENT_TYPES[doc.type] || doc.type}</h4>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(doc.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        {getStatusBadge(doc.statut)}
      </div>

      <div className="space-y-3">
        {doc.concours_code && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="font-semibold text-indigo-700">Concours {doc.concours_code}</span>
          </div>
        )}

        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all border-2 border-blue-200 group/link"
        >
          <svg className="w-5 h-5 group-hover/link:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Visualiser le document
        </a>

        {doc.statut === 'EN_ATTENTE' && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onValider(doc.id)}
              disabled={processing === doc.id}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {processing === doc.id ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valider
                </>
              )}
            </button>
            <button
              onClick={() => onRejeter(doc.id)}
              disabled={processing === doc.id}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Rejeter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}