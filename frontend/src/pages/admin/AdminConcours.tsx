import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Concours {
  id: number
  nom: string
  code: string
  description: string
  date_debut_inscription: string
  date_fin_inscription: string
  date_concours: string
  frais_inscription: number
  statut: string
  ville: string
  conditions: string
}

export default function AdminConcours() {
  const [concours, setConcours] = useState<Concours[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConcours, setEditingConcours] = useState<Concours | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    date_debut_inscription: '',
    date_fin_inscription: '',
    date_concours: '',
    frais_inscription: '',
    statut: 'OUVERT',
    ville: '',
    conditions: ''
  })

  useEffect(() => {
    loadConcours()
  }, [])

  const loadConcours = async () => {
    try {
      const response = await api.get('/concours')
      setConcours(response.data)
    } catch (err) {
      console.error('Erreur chargement concours:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      code: '',
      description: '',
      date_debut_inscription: '',
      date_fin_inscription: '',
      date_concours: '',
      frais_inscription: '',
      statut: 'OUVERT',
      ville: '',
      conditions: ''
    })
    setEditingConcours(null)
    setError('')
  }

  const openModal = (concoursToEdit?: Concours) => {
    if (concoursToEdit) {
      setEditingConcours(concoursToEdit)
      setFormData({
        nom: concoursToEdit.nom,
        code: concoursToEdit.code,
        description: concoursToEdit.description || '',
        date_debut_inscription: concoursToEdit.date_debut_inscription.split('T')[0],
        date_fin_inscription: concoursToEdit.date_fin_inscription.split('T')[0],
        date_concours: concoursToEdit.date_concours.split('T')[0],
        frais_inscription: concoursToEdit.frais_inscription.toString(),
        statut: concoursToEdit.statut,
        ville: concoursToEdit.ville || '',
        conditions: concoursToEdit.conditions || ''
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        ...formData,
        frais_inscription: parseFloat(formData.frais_inscription)
      }

      if (editingConcours) {
        await api.put(`/concours/${editingConcours.id}`, payload)
      } else {
        await api.post('/concours', payload)
      }

      setShowModal(false)
      resetForm()
      loadConcours()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce concours ?')) return

    try {
      await api.delete(`/concours/${id}`)
      loadConcours()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'OUVERT':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border-2 border-emerald-200 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Ouvert
          </span>
        )
      case 'FERME':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border-2 border-red-200 shadow-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Fermé
          </span>
        )
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-bold border-2 border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            Terminé
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-bold border-2 border-slate-200 shadow-sm">
            {statut}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-10 h-10 text-cyan-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-slate-700 font-semibold text-lg">Chargement des concours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Header avec illustration */}
      <div className="relative bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"></div>
          <svg className="absolute bottom-0 left-0 w-full h-32 text-white/5" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Gestion des Concours</h1>
                <p className="text-cyan-100 text-lg font-medium">Créez et gérez les écoles et dates de concours</p>
              </div>
            </div>
            
            <button
              onClick={() => openModal()}
              className="group flex items-center gap-3 px-6 py-4 bg-white text-cyan-600 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg hover:scale-105"
            >
              <div className="w-8 h-8 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Nouveau Concours
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStat
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          label="Ouverts"
          value={concours.filter(c => c.statut === 'OUVERT').length}
          gradient="from-emerald-400 to-green-500"
          bgGradient="from-emerald-50 to-green-50"
        />
        <QuickStat
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          label="Fermés"
          value={concours.filter(c => c.statut === 'FERME').length}
          gradient="from-red-400 to-rose-500"
          bgGradient="from-red-50 to-rose-50"
        />
        <QuickStat
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          label="Total"
          value={concours.length}
          gradient="from-cyan-400 to-blue-500"
          bgGradient="from-cyan-50 to-blue-50"
        />
      </div>

      {/* Grille de cartes des concours */}
      {concours.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-20 text-center border-2 border-dashed border-slate-200">
          <div className="w-28 h-28 bg-linear-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-3">Aucun concours enregistré</h3>
          <p className="text-slate-500 mb-6">Commencez par créer votre premier concours</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un concours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {concours.map((c) => (
            <ConcoursCard
              key={c.id}
              concours={c}
              onEdit={openModal}
              onDelete={handleDelete}
              getStatutBadge={getStatutBadge}
            />
          ))}
        </div>
      )}

      {/* Modal modernisé */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Header du modal */}
            <div className="relative bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {editingConcours ? 'Modifier le concours' : 'Nouveau concours'}
                    </h2>
                    <p className="text-cyan-100 text-sm">Remplissez tous les champs requis</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corps du formulaire */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl">
                  <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Nom de l'école *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-medium"
                    placeholder="Ex: École Nationale Supérieure Polytechnique"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-mono font-bold"
                    placeholder="Ex: ENSPY"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Brève description du concours..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Début inscriptions *
                  </label>
                  <input
                    type="date"
                    name="date_debut_inscription"
                    value={formData.date_debut_inscription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Fin inscriptions *
                  </label>
                  <input
                    type="date"
                    name="date_fin_inscription"
                    value={formData.date_fin_inscription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date concours *
                  </label>
                  <input
                    type="date"
                    name="date_concours"
                    value={formData.date_concours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Frais (FCFA) *
                  </label>
                  <input
                    type="number"
                    name="frais_inscription"
                    value={formData.frais_inscription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-bold"
                    min="0"
                    placeholder="50000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ville
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Ex: Yaoundé"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Statut *
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-semibold cursor-pointer"
                    required
                  >
                    <option value="OUVERT">✅ Ouvert</option>
                    <option value="FERME">🔒 Fermé</option>
                    <option value="TERMINE">✓ Terminé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Conditions d'admission
                </label>
                <textarea
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Ex: Baccalauréat séries C, D, E ou équivalent..."
                />
              </div>

              {/* Footer du modal */}
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="group relative px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingConcours ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickStat({
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
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
          <p className={`text-5xl font-black bg-linear-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
        </div>
        <div className={`w-14 h-14 bg-linear-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ConcoursCard({
  concours,
  onEdit,
  onDelete,
  getStatutBadge
}: {
  concours: Concours
  onEdit: (c: Concours) => void
  onDelete: (id: number) => void
  getStatutBadge: (statut: string) => React.ReactNode
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-100 hover:border-cyan-200">
      {/* Header de la carte */}
      <div className="relative bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6 border-b-2 border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-linear-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-lg">{concours.code.slice(0, 2)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1">{concours.nom}</h3>
              <span className="inline-flex items-center px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold border border-cyan-200">
                {concours.code}
              </span>
            </div>
          </div>
          {getStatutBadge(concours.statut)}
        </div>
        
        {concours.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{concours.description}</p>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Ville"
            value={concours.ville || 'Non spécifiée'}
          />
          <InfoItem
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Frais"
            value={`${concours.frais_inscription.toLocaleString()} FCFA`}
          />
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          <DateItem
            icon="📅"
            label="Date du concours"
            date={concours.date_concours}
            color="text-indigo-700 bg-indigo-50"
          />
          <DateItem
            icon="⏰"
            label="Fin des inscriptions"
            date={concours.date_fin_inscription}
            color="text-amber-700 bg-amber-50"
          />
        </div>

        {concours.conditions && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Conditions</p>
            <p className="text-sm text-slate-700 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {concours.conditions}
            </p>
          </div>
        )}
      </div>

      {/* Footer avec actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button
          onClick={() => onEdit(concours)}
          className="flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifier
        </button>
        <button
          onClick={() => onDelete(concours.id)}
          className="group/btn flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-semibold border-2 border-red-200 hover:border-red-600"
        >
          <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-cyan-500 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  )
}

function DateItem({
  icon,
  label,
  date,
  color
}: {
  icon: string
  label: string
  date: string
  color: string
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${color} border-2 border-white`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-sm font-black">
        {new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </span>
    </div>
  )
}