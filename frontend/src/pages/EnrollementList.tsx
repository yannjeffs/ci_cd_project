import React, { useState } from 'react';
import { useEnrollement } from '../contexts/EnrollementContext';
import { useNavigate } from 'react-router-dom';

const EnrollementList: React.FC = () => {
  const { enrollements, loading, setActiveEnrollement } = useEnrollement();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');


  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          label: 'Validé',
          linear: 'from-emerald-400 to-teal-500',
          bg: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          dotColor: 'bg-emerald-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'EN_ATTENTE':
      case 'COMPLET':
        return {
          label: statut === 'COMPLET' ? 'Complet' : 'En attente',
          linear: 'from-amber-400 to-orange-500',
          bg: 'from-amber-50 to-orange-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          dotColor: 'bg-amber-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'REJETE':
        return {
          label: 'Rejeté',
          linear: 'from-rose-400 to-red-500',
          bg: 'from-rose-50 to-red-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          dotColor: 'bg-rose-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          label: 'Inconnu',
          linear: 'from-slate-400 to-slate-500',
          bg: 'from-slate-50 to-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-700',
          dotColor: 'bg-slate-500',
          icon: null
        };
    }
  };

  const handleContinue = async (enrollement: any) => {
    await setActiveEnrollement(enrollement);
    navigate('/dashboard');
  };

  const handleDownloadFiche = (enrollementId: number) => {
    window.open(`${import.meta.env.VITE_API_URL}/enrollements/${enrollementId}/pdf`, '_blank');
  };

  const filteredEnrollements = filter === 'ALL' 
    ? enrollements 
    : enrollements.filter(e => e.statut === filter);

  const statusCounts = {
    ALL: enrollements.length,
    VALIDE: enrollements.filter(e => e.statut === 'VALIDE').length,
    EN_ATTENTE: enrollements.filter(e => e.statut === 'EN_ATTENTE' || e.statut === 'COMPLET').length,
    REJETE: enrollements.filter(e => e.statut === 'REJETE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30">
        <div className="text-center">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 border-4 border-blue-100/50 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-600/80 font-semibold text-lg">Chargement de vos inscriptions...</p>
          <p className="text-blue-400/60 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-sky-50/50 to-indigo-50/30 pb-16">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec design ondulé et soft */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-sky-400/20 to-indigo-400/20 rounded-[2.5rem] blur-3xl"></div>
          <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
            {/* Motif décoratif */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-200/20 to-transparent rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-sky-200/20 to-transparent rounded-full -ml-40 -mb-40"></div>
            
            <div className="relative p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-400/90 to-indigo-500/90 rounded-3xl shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-1">
                      Mes Inscriptions
                    </h1>
                    <p className="text-blue-600/70 text-lg font-medium">
                      Suivez l'évolution de vos candidatures
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/enrollements/new')}
                  className="group flex items-center gap-3 px-7 py-4 bg-linear-to-r from-blue-500/90 to-indigo-600/90 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm font-bold"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>Nouvelle inscription</span>
                </button>
              </div>

              {/* Statistiques avec design softer */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={statusCounts.ALL} linear="from-blue-400/80 to-sky-500/80" />
                <StatCard label="Validées" value={statusCounts.VALIDE} linear="from-emerald-400/80 to-teal-500/80" />
                <StatCard label="En cours" value={statusCounts.EN_ATTENTE} linear="from-amber-400/80 to-orange-500/80" />
                <StatCard label="Rejetées" value={statusCounts.REJETE} linear="from-rose-400/80 to-red-500/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de contrôle redessinée */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Filtres avec pills design */}
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'ALL', label: 'Toutes', icon: '📋', linear: 'from-blue-500 to-sky-600' },
                { value: 'VALIDE', label: 'Validées', icon: '✅', linear: 'from-emerald-500 to-teal-600' },
                { value: 'EN_ATTENTE', label: 'En attente', icon: '⏳', linear: 'from-amber-500 to-orange-600' },
                { value: 'REJETE', label: 'Rejetées', icon: '❌', linear: 'from-rose-500 to-red-600' }
              ].map(({ value, label, icon, linear }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`group relative px-5 py-3 rounded-2xl font-bold text-sm transition-all overflow-hidden ${
                    filter === value
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {filter === value && (
                    <div className={`absolute inset-0 bg-linear-to-r ${linear}`}></div>
                  )}
                  <div className="relative flex items-center gap-2.5">
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      filter === value ? 'bg-white/25' : 'bg-slate-200/80'
                    }`}>
                      {statusCounts[value as keyof typeof statusCounts]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Toggle vue avec design softer */}
            <div className="flex items-center gap-2 bg-slate-100/60 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                title="Grille"
              >
                <svg className={`w-5 h-5 ${viewMode === 'grid' ? 'scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Grille</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                  viewMode === 'timeline'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                title="Timeline"
              >
                <svg className={`w-5 h-5 ${viewMode === 'timeline' ? 'scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Timeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {filteredEnrollements.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-20 text-center">
            <div className="w-32 h-32 bg-linear-to-br from-blue-100/50 to-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/50">
              <svg className="w-16 h-16 text-blue-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">
              {filter === 'ALL' ? 'Aucune inscription' : 'Aucun résultat'}
            </h3>
            <p className="text-slate-600/80 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              {filter === 'ALL' 
                ? "Vous n'avez pas encore d'inscription. Lancez votre première candidature dès maintenant !"
                : `Aucune inscription ne correspond au filtre sélectionné.`
              }
            </p>
            {filter === 'ALL' && (
              <button
                onClick={() => navigate('/enrollements/new')}
                className="inline-flex items-center gap-3 px-8 py-5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer ma première inscription
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Vue grille redessinée avec design plus doux
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEnrollements.map((enrollement) => {
              const statusConfig = getStatusConfig(enrollement.statut);
              
              return (
                <div
                  key={enrollement.id}
                  className="group bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Header avec design wave */}
                  <div className="relative p-6 pb-8">
                    <div className={`absolute inset-0 bg-linear-to-br ${statusConfig.linear} opacity-5`}></div>
                    <svg className="absolute bottom-0 left-0 w-full h-8 text-white/50" viewBox="0 0 1440 48" fill="currentColor" preserveAspectRatio="none">
                      <path d="M0,24 C240,40 480,48 720,48 C960,48 1200,40 1440,24 L1440,48 L0,48 Z"></path>
                    </svg>
                    
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2 leading-tight">
                          {enrollement.concours.nom}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100/80 text-blue-700 rounded-xl text-xs font-bold border border-blue-200/50">
                            {enrollement.concours.code}
                          </span>
                        </div>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${statusConfig.linear} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        {statusConfig.icon}
                      </div>
                    </div>

                    {/* Badge statut avec design plus doux */}
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-linear-to-r ${statusConfig.bg} border-2 ${statusConfig.border} shadow-sm`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor} ${statusConfig.label === 'En attente' || statusConfig.label === 'Complet' ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-sm font-black ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Informations avec cards */}
                  <div className="px-6 space-y-3 mb-6">
                    {[
                      { icon: '📚', label: 'Département', value: enrollement.departement.nom },
                      { icon: '🎯', label: 'Filière', value: enrollement.filiere.nom },
                      { icon: '📊', label: 'Niveau', value: enrollement.niveau.nom },
                      { icon: '📅', label: 'Date d\'inscription', value: new Date(enrollement.date_enrolement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
                    ].map((info, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3.5 bg-linear-to-r from-slate-50/80 to-blue-50/50 rounded-2xl border border-slate-100/50">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">{info.label}</div>
                          <div className="text-sm font-bold text-slate-800 truncate">{info.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions avec design amélioré */}
                  <div className="px-6 pb-6 flex gap-3">
                    <button
                      onClick={() => handleContinue(enrollement)}
                      className="flex-1 group/btn flex items-center justify-center gap-2.5 px-5 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all font-bold shadow-md hover:shadow-lg"
                    >
                      <span>Continuer</span>
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    {enrollement.statut === 'VALIDE' && (
                      <button
                        onClick={() => handleDownloadFiche(enrollement.id)}
                        className="p-4 bg-slate-100/80 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
                        title="Télécharger la fiche"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vue timeline redessinée avec design plus élégant
          <div className="space-y-8">
            {filteredEnrollements.map((enrollement, index) => {
              const statusConfig = getStatusConfig(enrollement.statut);
              
              return (
                <div key={enrollement.id} className="relative">
                  {/* Ligne de connexion plus douce */}
                  {index < filteredEnrollements.length - 1 && (
                    <div className="absolute left-8 top-24 w-1 h-[calc(100%+2rem)] bg-linear-to-b from-blue-200/50 via-sky-200/50 to-indigo-200/50 rounded-full"></div>
                  )}
                  
                  <div className="flex gap-8">
                    {/* Timeline indicator redessiné */}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${statusConfig.linear} flex items-center justify-center text-white shadow-xl ring-4 ring-white/50`}>
                        {statusConfig.icon}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-100">
                        <span className="text-xs font-black text-blue-600">{index + 1}</span>
                      </div>
                    </div>

                    {/* Contenu avec design amélioré */}
                    <div className="flex-1 pb-8">
                      <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 overflow-hidden hover:shadow-2xl transition-all">
                        <div className="p-8">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                            <div className="flex-1">
                              <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">
                                {enrollement.concours.nom}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-linear-to-r ${statusConfig.bg} border-2 ${statusConfig.border}`}>
                                  <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor}`}></div>
                                  <span className={`text-sm font-black ${statusConfig.text}`}>
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <span className="px-4 py-2 bg-blue-100/80 text-blue-700 rounded-full text-sm font-bold">
                                  {enrollement.concours.code}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80 rounded-2xl border border-slate-200/50">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-bold text-slate-700">
                                {new Date(enrollement.date_enrolement).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <InfoBox label="Département" value={enrollement.departement.nom} />
                            <InfoBox label="Filière" value={enrollement.filiere.nom} />
                            <InfoBox label="Niveau" value={enrollement.niveau.nom} />
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <button
                              onClick={() => handleContinue(enrollement)}
                              className="flex items-center gap-3 px-7 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all font-bold shadow-md hover:shadow-lg"
                            >
                              <span>Continuer</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                            {enrollement.statut === 'VALIDE' && (
                              <button
                                onClick={() => handleDownloadFiche(enrollement.id)}
                                className="flex items-center gap-3 px-7 py-4 bg-slate-100/80 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all font-bold border-2 border-slate-200/50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Télécharger</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ label, value, linear }: { label: string; value: number; linear: string }) {
  return (
    <div className="relative bg-white/30 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-md hover:shadow-lg transition-all group overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${linear} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative">
        <div className={`text-4xl font-black bg-linear-to-br ${linear} bg-clip-text text-transparent mb-2`}>
          {value}
        </div>
        <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-linear-to-br from-slate-50/80 to-blue-50/50 rounded-2xl border border-slate-100/50">
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-800 truncate">{value}</div>
    </div>
  );
}

export default EnrollementList;