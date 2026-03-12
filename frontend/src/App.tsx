import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { EnrollementProvider } from './contexts/EnrollementContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AgentDashboard from './pages/agent/AgentDashboard'
import AdminPaiements from './pages/admin/AdminPaiements'
import AdminDocuments from './pages/admin/AdminDocuments'
import AdminConcours from './pages/admin/AdminConcours'
import AdminDepartements from './pages/admin/AdminDepartements'
import Layout from './components/Layout'
import VerifyEmailNotice from './pages/VerifyEmailNotice'
import VerifyEmail from './pages/VerifyEmail'
import VerifyEmailCode from './pages/VerifyEmailCode'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import StudentProfile from './pages/StudentProfile'
import Documents from './pages/Documents'
import Paiement from './pages/Paiement'
import Enrollement from './pages/Enrollement'
import Notifications from './pages/Notifications'
import EnrollementList from './pages/EnrollementList'
import NewEnrollement from './pages/NewEnrollement'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Routes de vérification email */}
      <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email-code" element={<VerifyEmailCode />} />

      {/* Routes de reset password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={user ? <EnrollementProvider><Layout /></EnrollementProvider> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={
            user?.role?.nom_role === 'ADMIN'
              ? <AdminDashboard />
              : user?.role?.nom_role === 'AGENT_DOCUMENTS'
                ? <AgentDashboard />
                : <Dashboard />
          }
        />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="documents" element={<Documents />} />
        <Route path="paiement" element={<Paiement />} />
        <Route path="enrollement" element={<Enrollement />} />
        <Route path="notifications" element={<Notifications />} />
        {/* NOUVEAU : Routes pour inscriptions multiples */}
        <Route path="enrollements" element={<EnrollementList />} />
        <Route path="enrollements/new" element={<NewEnrollement />} />
        {/* Routes Admin */}
        <Route path="admin/paiements" element={<AdminPaiements />} />
        <Route path="admin/documents" element={<AdminDocuments />} />
        <Route path="admin/concours" element={<AdminConcours />} />
        <Route path="admin/departements" element={<AdminDepartements />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
