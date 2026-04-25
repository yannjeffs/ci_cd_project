import React, { useState } from 'react';
import { useEnrollement } from '../contexts/EnrollementContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface Enrollement {
  id: number;
  concours?: {
    titre: string;
  };
  statut: string;
}

const ConcoursSelector: React.FC = () => {
  const { enrollements, activeEnrollement, setActiveEnrollement } = useEnrollement();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Validé
          </span>
        );
      case 'EN_ATTENTE':
      case 'COMPLET':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ En attente
          </span>
        );
      case 'REJETE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  const handleSelect = async (enrollement: Enrollement) => {
    try {
      await setActiveEnrollement(enrollement);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de concours:', error);
    }
  };

  if (enrollements.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-3">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">
                {activeEnrollement?.concours?.code || '?'}
              </span>
            </div>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">
              {activeEnrollement?.concours?.nom || 'Aucun concours sélectionné'}
            </p>
            <p className="text-xs text-gray-500">
              {activeEnrollement?.departement?.nom} - {activeEnrollement?.filiere?.nom}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {activeEnrollement && getStatusBadge(activeEnrollement.statut)}
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              {enrollements.map((enrollement) => (
                <button
                  key={enrollement.id}
                  onClick={() => handleSelect(enrollement)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    activeEnrollement?.id === enrollement.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activeEnrollement?.id === enrollement.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <span className={`font-bold text-sm ${
                          activeEnrollement?.id === enrollement.id ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {enrollement.concours?.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollement.concours?.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {enrollement.departement?.nom} - {enrollement.filiere?.nom}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(enrollement.statut)}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 p-2">
              {location.pathname !== '/enrollements/new' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/enrollements/new');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle inscription
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConcoursSelector;
