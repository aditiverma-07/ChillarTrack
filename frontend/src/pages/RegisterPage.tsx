import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wallet, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await registerUser(data.name, data.email, data.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl blue-gradient flex items-center justify-center shadow-blue-glow">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="font-black text-2xl text-slate-900 dark:text-dark-text">ChillarTrack</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-dark-text">Create your account 🚀</h1>
          <p className="text-slate-500 dark:text-dark-muted mt-1">Start tracking for free</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="register-form">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="Priya Sharma"
                className={`input ${errors.name ? 'input-error' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <input
                id="reg-email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Minimum 8 characters"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  id="toggle-reg-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="label">Confirm password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Repeat your password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base"
            >
              {isSubmitting ? 'Creating account...' : 'Create Free Account'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {['Track expenses instantly', 'Set savings goals', 'Earn achievement badges'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-dark-muted">
                <Check className="w-4 h-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-slate-600 dark:text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
