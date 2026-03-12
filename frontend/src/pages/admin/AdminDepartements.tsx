import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Departement {
  id: number
  nom: string
  description: string
  concours_id?: number
  concours?: {
    id: number
    nom: string
  }
}

export default function AdminDepartements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [selectedConcours, setSelectedConcours] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table')

  useEffect(() => {
    loadDepartements()
  }, [])

  const loadDepartements = async () => {
    try {
      const response = await api.get('/departements')
      setDepartements(response.data)
    } catch (err) {
      console.error('Erreur chargement départements:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async (departement: Departement) => {
    handleExport(departement, 'pdf')
  }

  const handleExportExcel = async (departement: Departement) => {
    handleExport(departement, 'excel')
  }

  const handleExport = async (departement: Departement, format: 'pdf' | 'excel') => {
    setDownloading(departement.id)
    try {
      const response = await api.get(`/departements/${departement.id}/export-etudiants?format=${format}`, {
        responseType: 'blob'
      })

      const type = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const extension = format === 'pdf' ? 'pdf' : 'xlsx'

      const blob = new Blob([response.data], { type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Liste_Etudiants_${departement.nom.replace(/\s+/g, '_')}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Erreur export ${format}:`, err)
      alert(`Erreur lors du téléchargement du ${format.toUpperCase()}`)
    } finally {
      setDownloading(null)
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-blue-600/80 font-semibold text-lg">Chargement des départements...</p>
          <p className="text-blue-400/60 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  // Grouper les départements par concours
  const groupedDepartments = departements.reduce((acc, dept) => {
    const concoursName = dept.concours?.nom || 'Autres Départements';
    if (!acc[concoursName]) {
      acc[concoursName] = [];
    }
    acc[concoursName].push(dept);
    return acc;
  }, {} as Record<string, Departement[]>);

  const concoursNames = Object.keys(groupedDepartments);
  // const activeConcours = selectedConcours || concoursNames[0];
  const filteredDepts = selectedConcours ? groupedDepartments[selectedConcours] : departements;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30 pb-16">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-sky-400/20 to-indigo-400/20 rounded-[2.5rem] blur-3xl"></div>
          <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
            {/* Motifs décoratifs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-200/20 to-transparent rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-sky-200/20 to-transparent rounded-full -ml-40 -mb-40"></div>
            
            <div className="relative p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-400/90 to-indigo-500/90 rounded-3xl shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-1">
                      Départements
                    </h1>
                    <p className="text-blue-600/70 text-lg font-medium">
                      Gestion et export des étudiants par département
                    </p>
                  </div>
                </div>
                
                {/* Toggle vue redesigné */}
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/60 shadow-md">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`group flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all font-bold text-sm ${
                      viewMode === 'table'
                        ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    <svg className={`w-5 h-5 ${viewMode === 'table' ? 'scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Tableau</span>
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`group flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all font-bold text-sm ${
                      viewMode === 'compact'
                        ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    <svg className={`w-5 h-5 ${viewMode === 'compact' ? 'scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Compact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques en haut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            label="Total"
            value={departements.length}
            sublabel="départements"
            linear="from-blue-400 to-sky-500"
          />
          <StatCard
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            label="Concours"
            value={concoursNames.length}
            sublabel="écoles"
            linear="from-indigo-400 to-purple-500"
          />
          <StatCard
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            label="Affichés"
            value={filteredDepts.length}
            sublabel="actuellement"
            linear="from-emerald-400 to-teal-500"
          />
          <StatCard
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            label="Exports"
            value="PDF & XLS"
            sublabel="disponibles"
            linear="from-amber-400 to-orange-500"
            isText
          />
        </div>

        {/* Filtres par concours en pills horizontaux */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-800">Filtrer par concours</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedConcours(null)}
              className={`group relative px-6 py-3 rounded-2xl font-bold text-sm transition-all overflow-hidden ${
                selectedConcours === null
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {selectedConcours === null && (
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-sky-600"></div>
              )}
              <div className="relative flex items-center gap-2.5">
                <span>Tous les départements</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  selectedConcours === null ? 'bg-white/25' : 'bg-slate-200/80'
                }`}>
                  {departements.length}
                </span>
              </div>
            </button>
            
            {concoursNames.map((concours) => (
              <button
                key={concours}
                onClick={() => setSelectedConcours(concours)}
                className={`group relative px-6 py-3 rounded-2xl font-bold text-sm transition-all overflow-hidden ${
                  selectedConcours === concours
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {selectedConcours === concours && (
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600"></div>
                )}
                <div className="relative flex items-center gap-2.5">
                  <span className="truncate max-w-xs">{concours}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    selectedConcours === concours ? 'bg-white/25' : 'bg-slate-200/80'
                  }`}>
                    {groupedDepartments[concours].length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Titre de section */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {selectedConcours || 'Tous les départements'}
          </h2>
          <p className="text-slate-600/80 mt-1 font-medium">
            {filteredDepts.length} département{filteredDepts.length > 1 ? 's' : ''} disponible{filteredDepts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Vue Tableau */}
        {viewMode === 'table' && filteredDepts.length > 0 && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-slate-50/80 to-blue-50/80 border-b-2 border-blue-200/50">
                    <th className="text-left py-5 px-6 text-xs font-black text-slate-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left py-5 px-6 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="text-left py-5 px-6 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-5 px-6 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Concours
                    </th>
                    <th className="text-right py-5 px-6 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredDepts.map((dept) => (
                    <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-md group-hover:scale-110 transition-transform">
                          {dept.id}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-bold text-slate-800 text-lg">{dept.nom}</div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="text-sm text-slate-600 max-w-md">
                          {dept.description || (
                            <span className="text-slate-400 italic">Aucune description</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-4 py-2 bg-indigo-100/80 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-200/50 shadow-sm">
                          {dept.concours?.nom || 'N/A'}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleExportPDF(dept)}
                            disabled={downloading === dept.id}
                            className="group/btn flex items-center gap-2.5 px-5 py-3 bg-linear-to-r from-blue-500 to-sky-600 text-white rounded-xl hover:from-blue-600 hover:to-sky-700 transition-all font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter en PDF"
                          >
                            {downloading === dept.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>PDF</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>PDF</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleExportExcel(dept)}
                            disabled={downloading === dept.id}
                            className="group/btn flex items-center gap-2.5 px-5 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter en Excel"
                          >
                            {downloading === dept.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>XLS</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>XLS</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vue Compact */}
        {viewMode === 'compact' && filteredDepts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepts.map((dept) => (
              <div
                key={dept.id}
                className="group bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    {dept.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-xl mb-2 truncate">{dept.nom}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {dept.description || (
                        <span className="text-slate-400 italic">Aucune description disponible</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Concours</span>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 bg-indigo-100/80 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-200/50">
                    {dept.concours?.nom || 'Non attribué'}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleExportPDF(dept)}
                    disabled={downloading === dept.id}
                    className="group/btn flex-1 flex items-center justify-center gap-3 py-4 bg-linear-to-r from-blue-500 to-sky-600 text-white rounded-2xl hover:from-blue-600 hover:to-sky-700 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="PDF"
                  >
                    {downloading === dept.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>PDF...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        <span>PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleExportExcel(dept)}
                    disabled={downloading === dept.id}
                    className="group/btn flex-1 flex items-center justify-center gap-3 py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Excel"
                  >
                    {downloading === dept.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>XLS...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        <span>Excel</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si vide */}
        {filteredDepts.length === 0 && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-20 text-center">
            <div className="w-28 h-28 bg-linear-to-br from-blue-100/50 to-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/50">
              <svg className="w-14 h-14 text-blue-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">Aucun département trouvé</h3>
            <p className="text-slate-600/80 text-lg mb-2">
              Aucun département ne correspond à vos critères de recherche
            </p>
            <p className="text-slate-500 text-sm">
              Modifiez vos filtres ou sélectionnez un autre concours
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  linear,
  isText = false
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sublabel: string
  linear: string
  isText?: boolean
}) {
  return (
    <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all group overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${linear} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">{label}</p>
          <p className={`font-black mb-1 ${isText ? 'text-2xl bg-linear-to-br ' + linear + ' bg-clip-text text-transparent' : 'text-5xl bg-linear-to-br ' + linear + ' bg-clip-text text-transparent'}`}>
            {value}
          </p>
          <p className="text-sm font-medium text-slate-500">{sublabel}</p>
        </div>
        <div className={`w-14 h-14 bg-linear-to-br ${linear} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}