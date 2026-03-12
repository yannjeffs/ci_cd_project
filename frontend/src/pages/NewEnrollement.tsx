import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollement } from '../contexts/EnrollementContext';
import api from '../services/api';

interface Concours {
  id: number;
  nom: string;
  code: string;
  statut: string;
}

interface Departement {
  id: number;
  nom: string;
  concours_id: number;
}

interface Filiere {
  id: number;
  nom: string;
  departement_id: number;
}

const NewEnrollement: React.FC = () => {
  const navigate = useNavigate();
  const { createEnrollement, enrollements } = useEnrollement();

  const [concours, setConcours] = useState<Concours[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [centresDepot, setCentresDepot] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    concours_id: '',
    departement_id: '',
    filiere_id: '',
    niveau_id: '',
    centre_depot_id: '',
    copy_documents_from: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [concoursRes, niveauxRes, centresRes] = await Promise.all([
        api.get('/concours/ouverts'),
        api.get('/niveaux'),
        api.get('/centre-depots'),
      ]);

      // Gérer le format de réponse {status: 'success', data: [...]} ou direct
      setConcours(concoursRes.data.data || concoursRes.data || []);
      setNiveaux(niveauxRes.data.data || niveauxRes.data || []);
      setCentresDepot(centresRes.data.data || centresRes.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    }
  };

  // Charger les départements quand un concours est sélectionné
  useEffect(() => {
    if (formData.concours_id) {
      loadDepartements(parseInt(formData.concours_id));
    } else {
      setDepartements([]);
      setFilieres([]);
    }
  }, [formData.concours_id]);

  // Charger les filières quand un département est sélectionné
  useEffect(() => {
    if (formData.departement_id) {
      loadFilieres(parseInt(formData.departement_id));
    } else {
      setFilieres([]);
    }
  }, [formData.departement_id]);

  const loadDepartements = async (concoursId: number) => {
    try {
      const response = await api.get('/departements');
      console.log('Départements reçus:', response.data); // DEBUG
      
      // Gérer le format de réponse {status: 'success', data: [...]} ou direct
      const departementsData = response.data.data || response.data || [];
      const filtered = departementsData.filter((d: Departement) => d.concours_id === concoursId);
      console.log('Départements filtrés:', filtered); // DEBUG
      setDepartements(filtered);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
      setDepartements([]);
    }
  };

  const loadFilieres = async (departementId: number) => {
    try {
      console.log('Chargement des filières pour département:', departementId); // DEBUG
      const response = await api.get(`/departements/${departementId}/filieres`);
      console.log('Filières reçues:', response.data); // DEBUG
      
      // L'API retourne {status: 'success', data: [...]}
      const filieresData = response.data.data || response.data || [];
      console.log('Filières extraites:', filieresData); // DEBUG
      setFilieres(filieresData);
    } catch (err) {
      console.error('Erreur lors du chargement des filières:', err);
      setFilieres([]); // Réinitialiser en cas d'erreur
      setError('Erreur lors du chargement des filières');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault(); // Empêcher tout comportement par défaut
    const { name, value } = e.target;
    
    console.log('handleChange appelé:', { name, value }); // DEBUG
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Réinitialiser les champs dépendants
      ...(name === 'concours_id' && { departement_id: '', filiere_id: '' }),
      ...(name === 'departement_id' && { filiere_id: '' }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier si déjà inscrit à ce concours
      const alreadyEnrolled = enrollements.some(
        e => e.concours_id === parseInt(formData.concours_id)
      );

      if (alreadyEnrolled) {
        setError('Vous êtes déjà inscrit à ce concours');
        setLoading(false);
        return;
      }

      await createEnrollement({
        concours_id: parseInt(formData.concours_id),
        departement_id: parseInt(formData.departement_id),
        filiere_id: parseInt(formData.filiere_id),
        niveau_id: parseInt(formData.niveau_id),
        centre_depot_id: parseInt(formData.centre_depot_id),
        copy_documents_from: formData.copy_documents_from ? parseInt(formData.copy_documents_from) : null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Inscription créée avec succès !
        </h2>
        <p className="text-gray-600">
          Vous allez être redirigé vers votre tableau de bord...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nouvelle Inscription
        </h1>
        <p className="text-gray-600 mb-6">
          Inscrivez-vous à un nouveau concours
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concours *
            </label>
            <select
              name="concours_id"
              value={formData.concours_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un concours</option>
              {concours.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département *
            </label>
            <select
              name="departement_id"
              value={formData.departement_id}
              onChange={handleChange}
              required
              disabled={!formData.concours_id || !departements || departements.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sélectionnez un département</option>
              {departements && departements.length > 0 ? (
                departements.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nom}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucun département disponible</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filière *
            </label>
            <select
              name="filiere_id"
              value={formData.filiere_id}
              onChange={handleChange}
              required
              disabled={!formData.departement_id || !filieres || filieres.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sélectionnez une filière</option>
              {filieres && filieres.length > 0 ? (
                filieres.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucune filière disponible</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau *
            </label>
            <select
              name="niveau_id"
              value={formData.niveau_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un niveau</option>
              {niveaux.map(n => (
                <option key={n.id} value={n.id}>
                  {n.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centre de dépôt *
            </label>
            <select
              name="centre_depot_id"
              value={formData.centre_depot_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un centre</option>
              {centresDepot.map(c => (
                <option key={c.id_centre_depot} value={c.id_centre_depot}>
                  {c.nom} - {c.region}
                </option>
              ))}
            </select>
          </div>

          {enrollements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copier les documents d'une inscription existante (optionnel)
              </label>
              <select
                name="copy_documents_from"
                value={formData.copy_documents_from}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Ne pas copier</option>
                {enrollements.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.concours.nom} - {e.departement.nom}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Les documents copiés devront être re-validés par les agents
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Création...' : 'Créer l\'inscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEnrollement;
