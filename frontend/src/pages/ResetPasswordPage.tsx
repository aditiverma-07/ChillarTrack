import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Check } from 'lucide-react'
import { authService } from '@/services'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const token = searchParams.get('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setIsLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Reset link is invalid or expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg px-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl blue-gradient flex items-center justify-center shadow-blue-glow mx-auto">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-dark-text">Reset Password</h1>
        </div>
        <div className="card">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-900 dark:text-dark-text">Password reset successful!</p>
              <p className="text-sm text-slate-500 mt-1">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="reset-password-form" className="space-y-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {!token && <p className="text-red-500 text-sm">Invalid reset link. Please request a new one.</p>}
              <div>
                <label htmlFor="new-password" className="label">New Password</label>
                <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Minimum 8 characters" required />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="label">Confirm Password</label>
                <input id="confirm-new-password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input" placeholder="Repeat new password" required />
              </div>
              <button type="submit" id="reset-submit-btn" disabled={isLoading || !token} className="btn-primary w-full">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <Link to="/login" className="block text-center text-sm text-primary-600 hover:underline">Back to Login</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
