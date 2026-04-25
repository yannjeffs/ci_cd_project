import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { AxiosError } from 'axios'

interface Filiere {
  id: number
  nom: string
  code_filiere: string
  departement_id?: number
}

interface Niveau {
  id: number
  nom: string
}

interface Departement {
  id: number
  nom: string
}

interface CentreDepot {
  id_centre_depot?: number
  id?: number
  nom: string
  adresse: string
  region: string
}

interface CentreExamen {
  id_centre_examen?: number
  id?: number
  nom: string
  adresse: string
  capacite: number
}

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

interface Etudiant {
  id: number
  matricule: string
  date_naissance: string
  sexe: string
  adresse: string
  telephone: string
  filiere: Filiere
  niveau: Niveau
  departement: Departement
  centreDepot: CentreDepot
  centreExamen: CentreExamen
  concours?: Concours
}

export default function StudentProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null)
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [filteredFilieres, setFilteredFilieres] = useState<Filiere[]>([])
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [centreDepots, setCentreDepots] = useState<CentreDepot[]>([])
  const [centreExamens, setCentreExamens] = useState<CentreExamen[]>([])
  const [concours, setConcours] = useState<Concours[]>([])
  const [selectedConcours, setSelectedConcours] = useState<Concours | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    matricule: '',
    date_naissance: '',
    sexe: 'M',
    adresse: '',
    telephone: '',
    numero_cni: '',
    region_origine: '',
    departement_origine: '',
    langue_parlee: 'Français',
    nom_pere: '',
    telephone_pere: '',
    nom_mere: '',
    telephone_mere: '',
    filiere_id: '',
    niveau_id: '',
    departement_id: '',
    centre_depot_id: '',
    centre_examen_id: '',
    concours_id: '',
  })

  const loadData = useCallback(async () => {
    try {
      const [filieresRes, niveauxRes, departementsRes, centreDepotsRes, centreExamensRes, concoursRes, meRes] = await Promise.all([
        api.get('/filieres'),
        api.get('/niveaux'),
        api.get('/departements'),
        api.get('/centre-depots'),
        api.get('/centre-examens'),
        api.get('/concours'),
        api.get('/me'),
      ])

      // Gérer les différents formats de réponse
      setFilieres(Array.isArray(filieresRes.data) ? filieresRes.data : filieresRes.data?.data || [])
      setNiveaux(Array.isArray(niveauxRes.data) ? niveauxRes.data : niveauxRes.data?.data || [])
      setDepartements(Array.isArray(departementsRes.data) ? departementsRes.data : departementsRes.data?.data || [])
      setCentreDepots(Array.isArray(centreDepotsRes.data) ? centreDepotsRes.data : centreDepotsRes.data?.data || [])
      setCentreExamens(Array.isArray(centreExamensRes.data) ? centreExamensRes.data : centreExamensRes.data?.data || [])
      setConcours(Array.isArray(concoursRes.data) ? concoursRes.data : concoursRes.data?.data || [])

      if (meRes.data.etudiant) {
        setEtudiant(meRes.data.etudiant)
        setFormData(prev => ({
          ...prev,
          matricule: meRes.data.etudiant.matricule,
          date_naissance: meRes.data.etudiant.date_naissance,
          sexe: meRes.data.etudiant.sexe,
          adresse: meRes.data.etudiant.adresse,
          telephone: meRes.data.etudiant.telephone || '',
          filiere_id: meRes.data.etudiant.filiere_id?.toString() || '',
          niveau_id: meRes.data.etudiant.niveau_id?.toString() || '',
          departement_id: meRes.data.etudiant.departement_id?.toString() || '',
          centre_depot_id: meRes.data.etudiant.centre_depot_id?.toString() || '',
          centre_examen_id: meRes.data.etudiant.centre_examen_id?.toString() || '',
          concours_id: meRes.data.etudiant.concours_id?.toString() || '',
        }))
        if (meRes.data.etudiant.concours) {
          setSelectedConcours(meRes.data.etudiant.concours)
        }
      }
    } catch (err: unknown) {
      console.error('Erreur chargement données:', err)
      setError('Erreur lors du chargement des données. Veuillez rafraîchir la page.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  }, [loadData])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Si on change le concours, mettre à jour selectedConcours et filtrer les départements
    if (name === 'concours_id') {
      const selected = concours.find(c => c.id === parseInt(value))
      setSelectedConcours(selected || null)

      // Reset filière et département
      setFormData(prev => ({ ...prev, concours_id: value, departement_id: '', filiere_id: '' }))
      setFilteredFilieres([])

      // Filtrer les départements pour ce concours
      if (value) {
        try {
          const response = await api.get(`/departements?concours_id=${value}`)
          const allDepts = Array.isArray(response.data) ? response.data : response.data.data;
          setDepartements(allDepts)
        } catch (error) {
          console.error('Erreur chargement départements:', error)
        }
      } else {
        setDepartements([])
      }
      return
    }

    setFormData({ ...formData, [name]: value })

    // Si on change le département, charger les filières correspondantes
    if (name === 'departement_id') {
      setFormData({ ...formData, departement_id: value, filiere_id: '' })
      setFilteredFilieres([])

      if (value) {
        try {
          const localFilieres = filieres.filter(f => f.departement_id === parseInt(value))

          if (localFilieres.length > 0) {
            setFilteredFilieres(localFilieres)
          } else {
            const response = await api.get(`/departements/${value}/filieres`)
            const filieresData = response.data.data || response.data || []
            setFilteredFilieres(Array.isArray(filieresData) ? filieresData : [])
          }
        } catch (error) {
          console.error('Erreur chargement filières:', error)
          const fallbackFilieres = filieres.filter(f => f.departement_id === parseInt(value))
          setFilteredFilieres(fallbackFilieres)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await api.post('/etudiants/register-profile', {
        ...formData,
        filiere_id: parseInt(formData.filiere_id),
        niveau_id: parseInt(formData.niveau_id),
        departement_id: parseInt(formData.departement_id),
        centre_depot_id: parseInt(formData.centre_depot_id),
        centre_examen_id: parseInt(formData.centre_examen_id),
        concours_id: parseInt(formData.concours_id),
      })

      setSuccess('Profil créé avec succès !')
      setEtudiant(response.data.etudiant)

      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: unknown) {
      setError((err as AxiosError<{ message: string }>).response?.data?.message || 'Erreur lors de la création du profil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Si l'étudiant a déjà un profil, afficher les infos
  if (etudiant) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* En-tête avec effet glassmorphism */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-3xl font-bold text-white">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {user?.prenom} {user?.nom}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Matricule:</span>
                    <span className="px-3 py-1 bg-linear-to-r from-blue-500 to-indigo-500 text-white font-mono font-semibold rounded-lg text-sm shadow-md">
                      {etudiant.matricule}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille d'informations avec cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Informations personnelles */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Informations Personnelles</h3>
              </div>
              <div className="space-y-4">
                <InfoRow label="Email" value={user?.email} icon="📧" />
                <InfoRow label="Téléphone" value={etudiant.telephone || '-'} icon="📱" />
                <InfoRow label="Date de naissance" value={new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')} icon="🎂" />
                <InfoRow label="Sexe" value={etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'} icon="👤" />
                <InfoRow label="Adresse" value={etudiant.adresse} icon="📍" />
              </div>
            </div>

            {/* Informations académiques */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Parcours Académique</h3>
              </div>
              <div className="space-y-4">
                <InfoRow label="Département" value={etudiant.departement?.nom || '-'} icon="🏛️" />
                <InfoRow label="Filière" value={etudiant.filiere?.nom || '-'} icon="📚" />
                <InfoRow label="Niveau" value={etudiant.niveau?.nom || '-'} icon="📊" />
              </div>
            </div>

            {/* Centres */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Centres Assignés</h3>
              </div>
              <div className="space-y-4">
                <InfoRow label="Centre de dépôt" value={etudiant.centreDepot?.nom || '-'} icon="📥" />
                <InfoRow label="Centre d'examen" value={etudiant.centreExamen?.nom || '-'} icon="✍️" />
              </div>
            </div>

            {/* Concours */}
            {etudiant.concours && (
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">Concours Sélectionné</h3>
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold mb-2">{etudiant.concours.nom}</h4>
                  <div className="flex items-center gap-2 text-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Date: {new Date(etudiant.concours.date_concours).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message de confirmation */}
          <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-1">Profil complété avec succès !</h4>
                <p className="text-green-50">Vous pouvez maintenant téléverser vos documents pour finaliser votre inscription.</p>
              </div>
            </div>
          </div>

          {/* Bouton d'action */}
          <button
            onClick={() => navigate('/documents')}
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span>Continuer vers les Documents</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Formulaire de création de profil
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête du formulaire */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Complétez votre profil
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Renseignez vos informations pour finaliser votre inscription au concours et obtenir votre matricule.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Choix du Concours */}
            <FormSection 
              title="Choix du Concours" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              linear="from-blue-500 to-indigo-500"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">École / Concours *</label>
                <select
                  name="concours_id"
                  value={formData.concours_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                  required
                >
                  <option value="">Sélectionner un concours</option>
                  {concours.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.statut !== 'OUVERT'}>
                      {c.nom} ({c.code}) - {c.ville} {c.statut !== 'OUVERT' ? `[${c.statut}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedConcours && (
                <div className="mt-5 p-5 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                  <h4 className="font-bold text-blue-900 text-lg mb-3">{selectedConcours.nom}</h4>
                  <p className="text-gray-700 mb-4 leading-relaxed">{selectedConcours.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <DetailCard icon="📅" label="Date du concours" value={new Date(selectedConcours.date_concours).toLocaleDateString('fr-FR')} />
                    <DetailCard icon="💰" label="Frais d'inscription" value={`${selectedConcours.frais_inscription.toLocaleString()} FCFA`} valueClass="text-blue-700 font-bold" />
                    <DetailCard icon="📍" label="Ville" value={selectedConcours.ville} />
                    <DetailCard icon="⏰" label="Fin des inscriptions" value={new Date(selectedConcours.date_fin_inscription).toLocaleDateString('fr-FR')} valueClass="text-orange-600 font-semibold" />
                  </div>
                  {selectedConcours.conditions && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex gap-2">
                        <span className="text-lg">📋</span>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-700">Conditions:</span>
                          <p className="text-gray-600 mt-1">{selectedConcours.conditions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FormSection>

            {/* Informations personnelles */}
            <FormSection 
              title="Informations Personnelles" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              linear="from-purple-500 to-pink-500"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <InputField label="Matricule *" name="matricule" value={formData.matricule} onChange={handleChange} placeholder="Ex: 21A001" required />
                <InputField label="Téléphone (WhatsApp) *" name="telephone" type="tel" value={formData.telephone} onChange={handleChange} placeholder="Ex: +237 6XX XXX XXX" helper="Pour recevoir les notifications" required />
                <InputField label="Date de naissance *" name="date_naissance" type="date" value={formData.date_naissance} onChange={handleChange} required />
                <SelectField label="Sexe *" name="sexe" value={formData.sexe} onChange={handleChange} options={[
                  { value: 'M', label: 'Masculin' },
                  { value: 'F', label: 'Féminin' }
                ]} required />
                <InputField label="N° CNI *" name="numero_cni" value={formData.numero_cni} onChange={handleChange} placeholder="Ex: 1234567890123" required />
                <SelectField label="Langue parlée *" name="langue_parlee" value={formData.langue_parlee} onChange={handleChange} options={[
                  { value: 'Français', label: 'Français' },
                  { value: 'Anglais', label: 'Anglais' },
                  { value: 'Bilingue', label: 'Bilingue (Français/Anglais)' }
                ]} required />
                <SelectField label="Région d'origine *" name="region_origine" value={formData.region_origine} onChange={handleChange} options={[
                  { value: '', label: 'Sélectionner' },
                  { value: 'Centre', label: 'Centre' },
                  { value: 'Littoral', label: 'Littoral' },
                  { value: 'Ouest', label: 'Ouest' },
                  { value: 'Sud', label: 'Sud' },
                  { value: 'Est', label: 'Est' },
                  { value: 'Nord', label: 'Nord' },
                  { value: 'Adamaoua', label: 'Adamaoua' },
                  { value: 'Extrême-Nord', label: 'Extrême-Nord' },
                  { value: 'Nord-Ouest', label: 'Nord-Ouest' },
                  { value: 'Sud-Ouest', label: 'Sud-Ouest' }
                ]} required />
                <InputField label="Département d'origine *" name="departement_origine" value={formData.departement_origine} onChange={handleChange} placeholder="Ex: Nyong-et-Kellé" required />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse *</label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white hover:border-gray-300"
                  rows={3}
                  placeholder="Votre adresse complète"
                  required
                />
              </div>
            </FormSection>

            {/* Informations parents */}
            <FormSection 
              title="Informations Familiales" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              linear="from-green-500 to-teal-500"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <InputField label="Nom du père *" name="nom_pere" value={formData.nom_pere} onChange={handleChange} placeholder="Nom complet du père" required />
                <InputField label="Téléphone du père *" name="telephone_pere" type="tel" value={formData.telephone_pere} onChange={handleChange} placeholder="Ex: 679153989" required />
                <InputField label="Nom de la mère *" name="nom_mere" value={formData.nom_mere} onChange={handleChange} placeholder="Nom complet de la mère" required />
                <InputField label="Téléphone de la mère *" name="telephone_mere" type="tel" value={formData.telephone_mere} onChange={handleChange} placeholder="Ex: 681443803" required />
              </div>
            </FormSection>

            {/* Choix académiques */}
            <FormSection 
              title="Choix Académiques" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              linear="from-orange-500 to-red-500"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Département souhaité *</label>
                  <select
                    name="departement_id"
                    value={formData.departement_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    required
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filière *</label>
                  <select
                    name="filiere_id"
                    value={formData.filiere_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200"
                    required
                    disabled={!formData.departement_id}
                  >
                    <option value="">
                      {!formData.departement_id ? 'Sélectionnez d\'abord un département' : 'Sélectionner une filière'}
                    </option>
                    {filteredFilieres.map((f) => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                  {!formData.departement_id && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Veuillez d'abord sélectionner un département
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau *</label>
                  <select
                    name="niveau_id"
                    value={formData.niveau_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((n) => (
                      <option key={n.id} value={n.id}>{n.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </FormSection>

            {/* Centres */}
            <FormSection 
              title="Centres d'Examen et de Dépôt" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              linear="from-cyan-500 to-blue-500"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Centre de dépôt *</label>
                  <select
                    name="centre_depot_id"
                    value={formData.centre_depot_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    required
                  >
                    <option value="">Sélectionner un centre de dépôt</option>
                    {centreDepots.map((c) => (
                      <option key={c.id_centre_depot || c.id} value={c.id_centre_depot || c.id}>
                        {c.nom} - {c.region}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Où vous déposerez votre dossier physique
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Centre d'examen *</label>
                  <select
                    name="centre_examen_id"
                    value={formData.centre_examen_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    required
                  >
                    <option value="">Sélectionner un centre d'examen</option>
                    {centreExamens.map((c) => (
                      <option key={c.id_centre_examen || c.id} value={c.id_centre_examen || c.id}>
                        {c.nom} ({c.capacite} places)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Où vous passerez votre examen
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Bouton de soumission */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enregistrer mon profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Composants helpers pour une meilleure organisation
function InfoRow({ label, value, icon }: { label: string; value?: string; icon: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-gray-800 font-semibold truncate">{value}</p>
      </div>
    </div>
  )
}

function DetailCard({ icon, label, value, valueClass = "text-gray-800" }: { icon: string; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
      <span className="text-lg shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 mb-0.5">{label}</p>
        <p className={`font-semibold ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}

function FormSection({ title, icon, linear, children }: { title: string; icon: React.ReactNode; linear: string; children: React.ReactNode }) {
  return (
    <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-11 h-11 bg-linear-to-br ${linear} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// Types pour les options du SelectField
interface SelectOption {
  value: string | number
  label: string
}

// Types pour InputField
interface InputFieldProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  helper?: string
  required?: boolean
}

// Types pour SelectField
interface SelectFieldProps {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  required?: boolean
}

function InputField({ label, name, type = "text", value, onChange, placeholder, helper, required = false }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
        placeholder={placeholder}
        required={required}
      />
      {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, required = false }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}