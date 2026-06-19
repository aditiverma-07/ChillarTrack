import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Target,
  Bell, User, LogOut, Sun, Moon, Menu, X, Wallet, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
    refetchInterval: 60000,
  })

  const unreadCount = notificationsData?.data?.filter((n: { read: boolean }) => !n.read)?.length ?? 0

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center shadow-blue-glow">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-dark-text text-lg leading-none">ChillarTrack</h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">Smart money for Gen-Z</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Alerts' && unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-bg mb-3">
          <div className="w-9 h-9 rounded-full blue-gradient flex items-center justify-center flex-shrink-0">
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-dark-text truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-dark-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            aria-label="Toggle theme"
            className="btn-ghost flex-1 text-sm py-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={handleLogout}
            id="logout-btn"
            aria-label="Logout"
            className="btn-ghost flex-1 text-sm py-2 text-red-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-dark-surface border-r border-slate-100 dark:border-dark-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-surface z-50 lg:hidden flex flex-col"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-2" aria-label="Close sidebar">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white dark:bg-dark-surface border-b border-slate-100 dark:border-dark-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            id="mobile-menu-btn"
            aria-label="Open menu"
            className="btn-ghost p-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg blue-gradient flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-dark-text">ChillarTrack</span>
          </div>
          <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
