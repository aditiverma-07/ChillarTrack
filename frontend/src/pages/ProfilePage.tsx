import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, DollarSign, Bell, Save, Camera, Shield } from 'lucide-react'
import { profileService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  monthlyBudget: z.number().positive().optional(),
  weeklyLimit: z.number().positive().optional(),
  currency: z.string().length(3, 'Must be 3-letter code').optional(),
  profilePhotoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notificationsEnabled: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.get,
  })

  const profile = data?.data ?? user

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      name: profile?.name,
      monthlyBudget: profile?.monthlyBudget,
      weeklyLimit: profile?.weeklyLimit,
      currency: profile?.currency ?? 'INR',
      profilePhotoUrl: profile?.profilePhotoUrl ?? '',
      notificationsEnabled: profile?.notificationsEnabled ?? true,
    }
  })

  const updateMutation = useMutation({
    mutationFn: profileService.update,
    onSuccess: (res) => {
      updateUser(res.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  const onSubmit = (data: FormData) => updateMutation.mutate(data)

  if (isLoading) return <LoadingSpinner className="py-24" />

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="section-title">Profile & Settings</h1>
        <p className="section-subtitle">Manage your account and preferences</p>
      </div>

      {/* Avatar section */}
      <div className="card flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl blue-gradient flex items-center justify-center shadow-blue-glow overflow-hidden">
            {profile?.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-3xl">{profile?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">{profile?.name}</h2>
          <p className="text-slate-500 dark:text-dark-muted text-sm">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${profile?.emailVerified ? 'badge-green' : 'badge-orange'}`}>
              {profile?.emailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
            </span>
            <span className="badge badge-blue">{profile?.role}</span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} id="profile-form" className="space-y-6">
        {/* Personal Info */}
        <div className="card space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" /> Personal Info
          </h3>
          <div>
            <label htmlFor="profile-name" className="label">Full Name</label>
            <input id="profile-name" type="text" {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="profile-photo-url" className="label">Profile Photo URL</label>
            <input id="profile-photo-url" type="url" {...register('profilePhotoUrl')} placeholder="https://..." className={`input ${errors.profilePhotoUrl ? 'input-error' : ''}`} />
            {errors.profilePhotoUrl && <p className="text-red-500 text-xs mt-1">{errors.profilePhotoUrl.message}</p>}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="card space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" /> Budget Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthly-budget" className="label">Monthly Budget</label>
              <input id="monthly-budget" type="number" {...register('monthlyBudget', { valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label htmlFor="weekly-limit" className="label">Weekly Limit</label>
              <input id="weekly-limit" type="number" {...register('weeklyLimit', { valueAsNumber: true })} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="currency" className="label">Currency (3-letter ISO code)</label>
            <input id="currency" type="text" {...register('currency')} placeholder="INR" maxLength={3} className={`input uppercase ${errors.currency ? 'input-error' : ''}`} />
            {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary-600" /> Notifications
          </h3>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-slate-900 dark:text-dark-text">Enable in-app notifications</p>
              <p className="text-sm text-slate-500 dark:text-dark-muted">Receive budget alerts and weekly summaries</p>
            </div>
            <div className="relative">
              <input id="notifications-enabled" type="checkbox" {...register('notificationsEnabled')} className="sr-only peer" />
              <label htmlFor="notifications-enabled" className="relative w-11 h-6 bg-slate-200 dark:bg-dark-border peer-checked:bg-primary-600 rounded-full cursor-pointer transition-colors duration-200 block after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
            </div>
          </label>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          id="save-profile-btn"
          disabled={isSubmitting}
          className={`btn-primary w-full ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
