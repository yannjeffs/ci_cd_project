import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserGuide from './UserGuide'
import ChatWidget from './ChatWidget'
import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../hooks/useNotifications'

// Composant NavLink pour desktop (vertical)
function NavLink({ to, icon, children }: { to: string; icon: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-0 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
          : 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
      }`}
      title={children as string}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform ${
        isActive ? 'scale-110' : 'group-hover:scale-110'
      }`}>
        {icon}
      </div>
      
      {/* Tooltip au hover */}
      <div className={`absolute left-full ml-4 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none ${
        isActive ? 'hidden' : ''
      }`}>
        {children}
        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
      </div>
    </Link>
  );
}

// Composant NavLink pour mobile (horizontal)
function NavLinkMobile({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 min-w-17.5 ${
        isActive 
          ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span className="text-[10px] font-bold leading-tight text-center">
        {label}
      </span>
    </Link>
  );
}

export default function Layout() {
      {/* Calculer les positions en cercle pour chaque item */}
    </div>
  </div>
</nav>

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Charger les notifications uniquement quand on ouvre le dropdown
  const handleOpenNotifications = () => {
    if (!showNotifications) {
      loadNotifications(1, 10) // Charger seulement 10
    }
    setShowNotifications(!showNotifications)
  }

  const getRoleColor = () => {
    if (isAdmin) return 'bg-purple-500'
    if (isAgent) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getRoleLabel = () => {
    if (user?.role?.nom_role === 'AGENT_DOCUMENTS') return 'AGENT_DOCUMENTS'
    return user?.role?.nom_role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-400">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* Header modernisé */}
      <header className="bg-linear-to-r from-blue-800 via-blue-900 to-blue-800 shadow-2xl border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo et titre */}
            <Link to="/dashboard" className="group flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">SGEE</h1>
                <p className="text-xs text-slate-400 font-medium">Système de Gestion des Étudiants</p>
              </div>
            </Link>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-3">
              {!isAdmin && !isAgent && (
                <div className="mr-2">
                  <UserGuide />
                </div>
              )}
              
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleOpenNotifications}
                  className="relative p-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl transition-all duration-200 group"
                >
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-linear-to-br from-red-500 to-pink-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panneau de notifications modernisé */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="bg-linear-to-r from-slate-800 to-slate-900 p-5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-white text-lg">Notifications</h3>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
                        >
                          Tout marquer
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-slate-500 font-medium">Aucune notification</p>
                          <p className="text-slate-400 text-sm mt-1">Vous êtes à jour !</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.lue ? 'bg-emerald-50/50' : ''}`}
                            onClick={() => !notif.lue && markAsRead(notif.id)}
                          >
                            <div className="flex items-start gap-3">
                              {!notif.lue && (
                                <div className="w-2.5 h-2.5 bg-linear-to-br from-emerald-500 to-green-600 rounded-full mt-2 shrink-0 shadow-lg"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 text-sm">{notif.titre}</p>
                                <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{notif.message}</p>
                                <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                      <Link
                        to="/notifications"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
                        onClick={() => setShowNotifications(false)}
                      >
                        Voir toutes les notifications
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu utilisateur */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl px-4 py-2.5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg font-bold text-white text-sm`}>
                      {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {user?.prenom} {user?.nom}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${isAdmin ? 'text-purple-400' : isAgent ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {getRoleLabel()}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu utilisateur */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-4 bg-linear-to-r from-slate-50 to-slate-100 border-b">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg font-bold text-white`}>
                          {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {user?.prenom} {user?.nom}
                          </p>
                          <p className={`text-xs font-semibold mt-1 inline-flex items-center px-2.5 py-1 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700' : isAgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {getRoleLabel()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation modernisée */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
  <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border-2 border-blue-100/50 p-3">
    <div className="flex flex-col gap-2">
      <NavLink to="/dashboard" icon="🏠">
        Tableau de bord
      </NavLink>
      {!isAdmin && !isAgent && (
        <>
          <NavLink to="/enrollement" icon="📝">
            Mon Enrôlement
          </NavLink>
          <NavLink to="/enrollements" icon="📋">
            Mes Inscriptions
          </NavLink>
          <NavLink to="/documents" icon="📄">
            Mes Documents
          </NavLink>
          <NavLink to="/paiement" icon="💳">
            Mes Paiements
          </NavLink>
        </>
      )}
      {isAgent && <></>}
      {isAdmin && (
        <>
          <NavLink to="/admin/paiements" icon="💰">
            Paiements
          </NavLink>
          <NavLink to="/admin/documents" icon="📑">
            Documents
          </NavLink>
          <NavLink to="/admin/concours" icon="🎓">
            Concours
          </NavLink>
          <NavLink to="/admin/departements" icon="🏢">
            Départements
          </NavLink>
        </>
      )}
    </div>
  </div>
</nav>

<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
  <div className="bg-white/90 backdrop-blur-xl border-t-2 border-blue-100/50 shadow-2xl">
    <div className="flex justify-around items-center px-2 py-2 max-w-2xl mx-auto overflow-x-auto">
      <NavLinkMobile to="/dashboard" icon="🏠" label="Dashboard" />
      {!isAdmin && !isAgent && (
        <>
          <NavLinkMobile to="/enrollement" icon="📝" label="Enrôlement" />
          <NavLinkMobile to="/enrollements" icon="📋" label="Inscriptions" />
          <NavLinkMobile to="/documents" icon="📄" label="Documents" />
          <NavLinkMobile to="/paiement" icon="💳" label="Paiements" />
        </>
      )}
      {isAgent && <></>}
      {isAdmin && (
        <>
          <NavLinkMobile to="/admin/paiements" icon="💰" label="Paiements" />
          <NavLinkMobile to="/admin/documents" icon="📑" label="Documents" />
          <NavLinkMobile to="/admin/concours" icon="🎓" label="Concours" />
          <NavLinkMobile to="/admin/departements" icon="🏢" label="Départements" />
        </>
      )}
    </div>
  </div>
</nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Chatbot Widget */}
      <ChatWidget />
    </div>
  )
}

