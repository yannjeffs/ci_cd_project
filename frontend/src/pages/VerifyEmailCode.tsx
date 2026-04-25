import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AxiosError } from 'axios'

export default function VerifyEmailCode() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Empêcher plus d'un caractère
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newCode = pastedData.split('')
    setCode([...newCode, ...Array(6 - newCode.length).fill('')])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    
    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/email/verify', { code: fullCode, email })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      setError((err as AxiosError<{ message: string }>).response?.data?.message || 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    
    try {
      await api.post('/email/resend', { email })
      alert('Un nouveau code a été envoyé à votre email')
    } catch (err: unknown) {
      setError((err as AxiosError<{ message: string }>).response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Email non fourni</p>
          <Link to="/register" className="text-blue-600 hover:underline">
            Retour à l'inscription
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">SGEE</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Email vérifié !</h2>
              <p className="text-gray-600">Redirection vers la connexion...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérifiez votre email</h2>
                <p className="text-gray-600 text-sm">
                  Un code à 6 chiffres a été envoyé à<br />
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition"
                    />
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.join('').length !== 6}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mb-4"
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
