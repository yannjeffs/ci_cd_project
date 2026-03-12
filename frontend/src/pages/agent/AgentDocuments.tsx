import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Document {
  id: number
  type: string
  statut: string
  date: string
  url: string
  date_validation?: string
  motif_rejet?: string
  valide_par?: string
}

interface StudentDocuments {
  etudiant_id: number
  etudiant_nom: string
  etudiant_email: string
  nombre_documents: number
  documents: Document[]
}

interface ConcoursGroup {
  concours_id: number
  concours_nom: string
  concours_annee: string | null
  total_etudiants: number
  total_documents: number
  etudiants: StudentDocuments[]
}

const DOCUMENT_TYPES: Record<string, string> = {
  'ACTE_NAISSANCE': 'Acte de naissance',
  'DIPLOME_BAC': 'Diplôme du BAC',
  'RELEVE_NOTES': 'Relevé de notes',
  'PHOTO_IDENTITE': "Photo d'identité",
  'CNI': 'Carte nationale d\'identité',
  'CERTIFICAT_MEDICAL': 'Certificat médical',
  'AUTRE': 'Autre document',
}

interface AgentDocumentsProps {
  onDocumentProcessed?: () => void
}

export default function AgentDocuments({ onDocumentProcessed }: AgentDocumentsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'archived'>('pending')
  const [pendingData, setPendingData] = useState<ConcoursGroup[]>([])
  const [archivedData, setArchivedData] = useState<ConcoursGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [expandedConcours, setExpandedConcours] = useState<Set<number>>(new Set())
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadDocuments()
  }, [activeTab])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      if (activeTab === 'pending') {
        const res = await api.get('/agent/documents')
        setPendingData(res.data.data || res.data || [])
      } else {
        const res = await api.get('/agent/documents/archived')
        setArchivedData(res.data.data || res.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement documents agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id: number) => {
    if (!confirm('Confirmer la validation de ce document ?')) return
    setProcessing(id)
    try {
      await api.post(`/agent/documents/${id}/validate`)
      loadDocuments()
      onDocumentProcessed?.() // Notifier le parent pour recharger les stats
    } catch (error) {
      console.error('Erreur validation:', error)
      alert('Erreur lors de la validation')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    const motif = prompt('Motif du rejet :')
    if (!motif) return
    setProcessing(id)
    try {
      await api.post(`/agent/documents/${id}/reject`, { motif_rejet: motif })
      loadDocuments()
      onDocumentProcessed?.() // Notifier le parent pour recharger les stats
    } catch (error) {
      console.error('Erreur rejet:', error)
      alert('Erreur lors du rejet')
    } finally {
      setProcessing(null)
    }
  }

  const toggleConcours = (concoursId: number) => {
    const newExpanded = new Set(expandedConcours)
    if (newExpanded.has(concoursId)) newExpanded.delete(concoursId)
    else newExpanded.add(concoursId)
    setExpandedConcours(newExpanded)
  }

  const toggleStudent = (etudiantId: number) => {
    const newExpanded = new Set(expandedStudents)
    if (newExpanded.has(etudiantId)) newExpanded.delete(etudiantId)
    else newExpanded.add(etudiantId)
    setExpandedStudents(newExpanded)
  }

  const renderDocuments = (data: ConcoursGroup[]) => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          {activeTab === 'pending' ? 'Aucun document en attente' : 'Aucun document archivé'}
        </div>
      )
    }

    return data.map((concours) => (
      <div key={concours.concours_id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
        {/* En-tête du concours */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{concours.concours_nom}</h2>
              {concours.concours_annee && (
                <p className="text-green-100 text-sm mt-1">Année: {concours.concours_annee}</p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{concours.total_etudiants}</p>
                <p className="text-sm text-green-100">Candidat{concours.total_etudiants > 1 ? 's' : ''}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{concours.total_documents}</p>
                <p className="text-sm text-green-100">Document{concours.total_documents > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => toggleConcours(concours.concours_id)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 font-medium"
              >
                {expandedConcours.has(concours.concours_id) ? '▼ Masquer' : '▶ Afficher'}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des étudiants */}
        {expandedConcours.has(concours.concours_id) && (
          <div className="p-4 space-y-3">
            {concours.etudiants.map((student) => (
              <div key={student.etudiant_id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-white p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {student.etudiant_nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{student.etudiant_nom}</h3>
                      <p className="text-sm text-gray-600">{student.etudiant_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeTab === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.nombre_documents} document{student.nombre_documents > 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => toggleStudent(student.etudiant_id)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      {expandedStudents.has(student.etudiant_id) ? '▼ Masquer' : '▶ Voir détails'}
                    </button>
                  </div>
                </div>

                {expandedStudents.has(student.etudiant_id) && (
                  <div className="p-4">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Date</th>
                          {activeTab === 'archived' && (
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Statut</th>
                          )}
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Document</th>
                          {activeTab === 'pending' && (
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {student.documents.map((doc) => (
                          <tr key={doc.id} className="border-t hover:bg-gray-50">
                            <td className="py-3 px-3 font-medium">{DOCUMENT_TYPES[doc.type] || doc.type}</td>
                            <td className="py-3 px-3 text-gray-600 text-sm">{new Date(doc.date).toLocaleDateString('fr-FR')}</td>
                            {activeTab === 'archived' && (
                              <td className="py-3 px-3">
                                {doc.statut === 'VALIDE' ? (
                                  <div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✓ Validé</span>
                                    {doc.valide_par && (
                                      <p className="text-xs text-gray-500 mt-1">Par: {doc.valide_par}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">✗ Rejeté</span>
                                    {doc.valide_par && (
                                      <p className="text-xs text-gray-500 mt-1">Par: {doc.valide_par}</p>
                                    )}
                                  </div>
                                )}
                                {doc.motif_rejet && (
                                  <p className="text-xs text-red-600 mt-1">Motif: {doc.motif_rejet}</p>
                                )}
                              </td>
                            )}
                            <td className="py-3 px-3">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">📄 Voir le fichier</a>
                            </td>
                            {activeTab === 'pending' && (
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleValidate(doc.id)}
                                    disabled={processing === doc.id}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => handleReject(doc.id)}
                                    disabled={processing === doc.id}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Rejeter
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Agent - Documents</h1>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'pending'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 En attente
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'archived'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📁 Archives
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {renderDocuments(activeTab === 'pending' ? pendingData : archivedData)}
      </div>
    </div>
  )
}
