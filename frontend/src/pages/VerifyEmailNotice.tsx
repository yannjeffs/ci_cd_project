import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { resendVerification } from '../services/api'

export default function VerifyEmailNotice() {
  const location = useLocation()
  const email = location.state?.email || ''
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!email) {
      setError('Email non disponible')
      return
    }
    
    setLoading(true)
    setMessage('')
    setError('')

    try {
      await resendVerification(email)
      setMessage('Un nouveau lien de vérification a été envoyé !')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">SGEE</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vérifiez votre email</h2>
          
          <p className="text-gray-600 mb-6">
            Nous avons envoyé un lien de vérification à{' '}
            <strong className="text-gray-800">{email || 'votre adresse email'}</strong>.
            <br />
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={loading || !email}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Envoi...' : 'Renvoyer l\'email'}
          </button>

          <p className="text-gray-500 text-sm">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams.
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
