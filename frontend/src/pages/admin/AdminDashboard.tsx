import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

interface Stats {
  totalEtudiants: number;
  paiementsEnAttente: number;
  paiementsValides: number;
  enrollementsComplets: number;
  documentsEnAttente: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEtudiants: 0,
    paiementsEnAttente: 0,
    paiementsValides: 0,
    enrollementsComplets: 0,
    documentsEnAttente: 0,
  });
  const [recentPaiements, setRecentPaiements] = useState<PaiementData[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  interface PaiementData {
    id_paiement: number;
    etudiant?: {
      user?: {
        nom?: string;
        prenom?: string;
      };
    };
    montant: string;
    mode_paiement: string;
    statut: string;
  }

  interface DocumentData {
    id: number;
    etudiant: string;
    type: string;
    statut: string;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [etudiantsRes, paiementsRes, enrollementsRes, documentsRes] =
          await Promise.all([
            api.get("/etudiants"),
            api.get("/paiements"),
            api.get("/enrollements"),
            api.get("/documents"),
          ]);

        const etudiants = etudiantsRes.data.data || etudiantsRes.data || [];
        const paiements = paiementsRes.data.data || paiementsRes.data || [];
        const enrollements =
          enrollementsRes.data.data || enrollementsRes.data || [];
        const studentsWithDocs =
          documentsRes.data.data || documentsRes.data || [];
        // Aplatir la structure pour récupérer tous les documents
        const allDocuments = studentsWithDocs.flatMap((s: { documents?: DocumentData[]; etudiant_nom?: string }) =>
          (s.documents || []).map((d: DocumentData) => ({
            ...d,
            etudiant: s.etudiant_nom,
          })),
        );

        setStats({
          totalEtudiants: etudiants.length,
          paiementsEnAttente: paiements.filter(
            (p: PaiementData) => p.statut === "EN_ATTENTE",
          ).length,
          paiementsValides: paiements.filter((p: PaiementData) => p.statut === "VALIDE")
            .length,
          enrollementsComplets: enrollements.filter(
            (e: { statut: string }) => e.statut === "COMPLET" || e.statut === "VALIDE",
          ).length,
          documentsEnAttente: allDocuments.filter(
            (d: DocumentData) => d.statut === "EN_ATTENTE",
          ).length,
        });

        // Derniers paiements en attente
        setRecentPaiements(
          paiements.filter((p: PaiementData) => p.statut === "EN_ATTENTE").slice(0, 5),
        );

        // Derniers documents en attente
        setRecentDocuments(
          allDocuments
            .filter((d: DocumentData) => d.statut === "EN_ATTENTE")
            .slice(0, 5),
        );
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-green-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* Header avec gradient */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Tableau de bord
          </h1>
          <p className="text-green-100">Vue d'ensemble de l'administration</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Statistiques avec nouveau design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <StatCard
            title="Total Étudiants"
            value={stats.totalEtudiants}
            icon="👥"
            gradient="from-green-500 to-emerald-600"
            trend="+12%"
          />
          <StatCard
            title="En attente"
            value={stats.paiementsEnAttente}
            icon="⏳"
            gradient="from-amber-500 to-orange-600"
            trend="5 nouveaux"
          />
          <StatCard
            title="Validés"
            value={stats.paiementsValides}
            icon="✓"
            gradient="from-blue-500 to-cyan-600"
            trend="+23%"
          />
          <StatCard
            title="Enrôlements"
            value={stats.enrollementsComplets}
            icon="📋"
            gradient="from-purple-500 to-violet-600"
            trend={`${stats.enrollementsComplets} complets`}
          />
          <StatCard
            title="À valider"
            value={stats.documentsEnAttente}
            icon="📄"
            gradient="from-rose-500 to-pink-600"
            trend="Documents"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          {/* Paiements en attente - Design moderne */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💳</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Paiements récents
                  </h2>
                </div>
                <Link
                  to="/admin/paiements"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition shadow-sm"
                >
                  Voir tout
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentPaiements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl opacity-50">💳</span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Aucun paiement en attente
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Tout est à jour !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPaiements.map((p: PaiementData) => (
                    <div
                      key={p.id_paiement}
                      className="group relative flex justify-between items-center p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xl">💰</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {p.etudiant?.user?.nom} {p.etudiant?.user?.prenom}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <span className="font-bold text-amber-700">
                              {parseFloat(p.montant).toLocaleString()} FCFA
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="capitalize">
                              {p.mode_paiement}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/admin/paiements"
                        className="px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-md hover:shadow-lg"
                      >
                        Valider
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Documents en attente - Design moderne */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-linear-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-rose-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Documents récents
                  </h2>
                </div>
                <Link
                  to="/admin/documents"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition shadow-sm"
                >
                  Voir tout
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl opacity-50">📄</span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Aucun document en attente
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Tout est validé !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.map((d: DocumentData) => (
                    <div
                      key={d.id}
                      className="group relative flex justify-between items-center p-4 bg-linear-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xl">📋</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {d.etudiant || "Étudiant"}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            <span className="inline-flex items-center px-2.5 py-1 bg-white rounded-full text-xs font-medium text-rose-700 border border-rose-200">
                              {d.type}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/admin/documents"
                        className="px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-md hover:shadow-lg"
                      >
                        Vérifier
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides - Design carte moderne */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-slate-800 to-slate-900 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Accès rapide
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <QuickActionCard
                to="/admin/paiements"
                icon="💳"
                title="Paiements"
                subtitle={`${stats.paiementsEnAttente} en attente`}
                gradient="from-amber-400 to-orange-500"
              />
              <QuickActionCard
                to="/admin/documents"
                icon="📄"
                title="Documents"
                subtitle={`${stats.documentsEnAttente} à valider`}
                gradient="from-rose-400 to-pink-500"
              />
              <QuickActionCard
                to="/admin/etudiants"
                icon="👥"
                title="Étudiants"
                subtitle={`${stats.totalEtudiants} inscrits`}
                gradient="from-green-400 to-emerald-500"
              />
              <QuickActionCard
                to="/admin/enrollements"
                icon="📋"
                title="Enrôlements"
                subtitle={`${stats.enrollementsComplets} complets`}
                gradient="from-purple-400 to-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
}: {
  title: string;
  value: number;
  icon: string;
  gradient: string;
  trend?: string;
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
      ></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
          >
            <span className="text-2xl">{icon}</span>
          </div>
          <div
            className={`text-3xl font-black bg-linear-to-br ${gradient} bg-clip-text text-transparent`}
          >
            {value}
          </div>
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
        {trend && <p className="text-xs text-slate-500 font-medium">{trend}</p>}
      </div>
    </div>
  );
}

function QuickActionCard({
  to,
  icon,
  title,
  subtitle,
  gradient,
}: {
  to: string;
  icon: string;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <Link
      to={to}
      className="group relative bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
      <div className="relative flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
          <span className="text-3xl">{icon}</span>
        </div>
        <div className="flex-1">
          <span className="font-bold text-slate-800 group-hover:text-white block transition-colors text-lg">
            {title}
          </span>
          <span className="text-sm text-slate-500 group-hover:text-white/90 transition-colors mt-1 block">
            {subtitle}
          </span>
        </div>
        <svg
          className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
