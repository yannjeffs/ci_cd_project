import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface Enrollement {
  id: number;
  concours_id: number;
  departement_id: number;
  filiere_id: number;
  niveau_id: number;
  centre_depot_id: number;
  statut: 'EN_ATTENTE' | 'COMPLET' | 'VALIDE' | 'REJETE';
  date_enrolement: string;
  concours: {
    id: number;
    nom: string;
    code: string;
    statut: string;
  };
  departement: {
    id: number;
    nom: string;
  };
  filiere: {
    id: number;
    nom: string;
  };
  niveau: {
    id: number;
    nom: string;
  };
}

interface EnrollementContextType {
  enrollements: Enrollement[];
  activeEnrollement: Enrollement | null;
  loading: boolean;
  error: string | null;
  setActiveEnrollement: (enrollement: Enrollement) => Promise<void>;
  refreshEnrollements: () => Promise<void>;
  createEnrollement: (data: any) => Promise<Enrollement>;
}

const EnrollementContext = createContext<EnrollementContextType | undefined>(undefined);

export const EnrollementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [enrollements, setEnrollements] = useState<Enrollement[]>([]);
  const [activeEnrollement, setActiveEnrollementState] = useState<Enrollement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les enrôlements au montage
  useEffect(() => {
    refreshEnrollements();
  }, []);

  // Charger les enrôlements depuis l'API
  const refreshEnrollements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/my-enrollements');
      
      if (response.data.status === 'success') {
        const enrollementsData = response.data.data;
        setEnrollements(enrollementsData);

        // Définir l'enrôlement actif depuis localStorage ou le premier
        const savedActiveId = localStorage.getItem('active_enrollement_id');
        if (savedActiveId) {
          const saved = enrollementsData.find((e: Enrollement) => e.id === parseInt(savedActiveId));
          if (saved) {
            setActiveEnrollementState(saved);
          } else if (enrollementsData.length > 0) {
            setActiveEnrollementState(enrollementsData[0]);
          }
        } else if (enrollementsData.length > 0) {
          setActiveEnrollementState(enrollementsData[0]);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des enrôlements:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des enrôlements');
    } finally {
      setLoading(false);
    }
  };

  // Définir un enrôlement comme actif
  const setActiveEnrollement = async (enrollement: Enrollement) => {
    try {
      await api.put(`/enrollements/${enrollement.id}/set-active`);
      setActiveEnrollementState(enrollement);
      localStorage.setItem('active_enrollement_id', enrollement.id.toString());
      localStorage.setItem('active_concours_id', enrollement.concours_id.toString());
    } catch (err: any) {
      console.error('Erreur lors du changement d\'enrôlement actif:', err);
      throw err;
    }
  };

  // Créer un nouvel enrôlement
  const createEnrollement = async (data: any): Promise<Enrollement> => {
    try {
      const response = await api.post('/enrollements/create', data);
      
      if (response.data.status === 'success') {
        const newEnrollement = response.data.enrollement;
        
        // Rafraîchir la liste
        await refreshEnrollements();
        
        // Définir comme actif
        await setActiveEnrollement(newEnrollement);
        
        return newEnrollement;
      }
      
      throw new Error('Erreur lors de la création de l\'enrôlement');
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'enrôlement:', err);
      throw err;
    }
  };

  return (
    <EnrollementContext.Provider
      value={{
        enrollements,
        activeEnrollement,
        loading,
        error,
        setActiveEnrollement,
        refreshEnrollements,
        createEnrollement,
      }}
    >
      {children}
    </EnrollementContext.Provider>
  );
};

export const useEnrollement = () => {
  const context = useContext(EnrollementContext);
  if (context === undefined) {
    throw new Error('useEnrollement must be used within an EnrollementProvider');
  }
  return context;
};
