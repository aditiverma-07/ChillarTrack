import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Send, ArrowLeft } from 'lucide-react'
import { authService } from '@/services'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl blue-gradient flex items-center justify-center shadow-blue-glow mx-auto">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-dark-text">Forgot Password</h1>
          <p className="text-slate-500 dark:text-dark-muted mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="card">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-dark-text mb-2">Check your inbox!</h3>
              <p className="text-slate-600 dark:text-dark-muted text-sm mb-4">
                If an account exists for <strong>{email}</strong>, you'll receive a reset token in the backend logs.
              </p>
              <Link to="/login" className="btn-primary w-full">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="forgot-password-form" className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="label">Email address</label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input"
                />
              </div>
              <button type="submit" id="fp-submit-btn" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-dark-muted hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
