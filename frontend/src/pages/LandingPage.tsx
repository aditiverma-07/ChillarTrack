import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Wallet, Target, BarChart3, Bell, Shield,
  Zap, ChevronDown, Star, Check, TrendingUp, Award, Smartphone
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Beautiful charts showing where your money goes – daily, weekly, and monthly breakdowns.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set goals for gadgets, trips, or concerts. Track your progress with satisfying progress bars.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when you overspend on entertainment or exceed your weekly budget.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Award,
    title: 'Gamification',
    description: 'Earn badges like "Budget Master" and "No-Spend Ninja" for smart financial habits.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Log expenses on the go with a clean mobile interface. No laptop needed.',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'JWT authentication, BCrypt passwords, and HTTPS. Your data stays yours.',
    color: 'from-indigo-500 to-blue-500',
  },
]

const testimonials = [
  {
    name: 'Aisha Khan',
    role: '2nd year CSE, VIT Vellore',
    text: 'I used to blow my entire stipend in 2 weeks. ChillarTrack helped me save ₹8,000 for my first mechanical keyboard!',
    avatar: 'AK',
    rating: 5,
  },
  {
    name: 'Rohan Verma',
    role: 'Class 12, Delhi',
    text: 'The category breakdown showed me I was spending 60% on food delivery. Game changer!',
    avatar: 'RV',
    rating: 5,
  },
  {
    name: 'Preethi S',
    role: 'BCA 1st year, Bangalore',
    text: 'Finally saved enough for my concert tickets in 3 months using the Goals feature. The badges kept me motivated!',
    avatar: 'PS',
    rating: 5,
  },
]

const faqs = [
  {
    q: 'Is ChillarTrack free?',
    a: 'Yes! The core features – expense tracking, budgets, and goals – are completely free. We offer a Premium plan for advanced analytics and unlimited goals.',
  },
  {
    q: 'Can I track UPI payments?',
    a: 'Absolutely! You can categorize transactions by payment method including Cash, UPI, Debit Card, and Credit Card.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Yes. We use JWT authentication, BCrypt password hashing, and never store raw passwords. Your data is never sold.',
  },
  {
    q: 'Can I use it in multiple currencies?',
    a: 'Yes! You can set any 3-letter ISO currency code in your profile settings.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl blue-gradient flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-dark-text">ChillarTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-dark-muted">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-primary-600 transition-colors">Stories</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Login</Link>
            <Link to="/register" id="hero-cta-btn" className="btn-primary text-sm py-2.5">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge-blue text-sm mb-6 inline-flex">
              <Zap className="w-3.5 h-3.5" /> Built for Gen-Z 🇮🇳
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-dark-text leading-tight mt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Stop Wondering{' '}
            <span className="gradient-text">Where Your</span>
            <br />
            Chillar Went
          </motion.h1>

          <motion.p
            className="mt-6 text-xl text-slate-600 dark:text-dark-muted max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Track every rupee spent at the tapri, on UPI, or at Zomato. Set savings goals for your dream
            laptop or Goa trip. Earn badges for being a Budget Master. 💸
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/register" id="hero-main-cta" className="btn-primary text-base px-8 py-4">
              Start Tracking for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-4">
              See How It Works <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-slate-500 dark:text-dark-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            No credit card required · Works with UPI & Cash · 100% Free to start
          </motion.p>
        </div>

        {/* Dashboard Preview Card */}
        <motion.div
          className="max-w-4xl mx-auto mt-20 relative"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="card border-primary-100 dark:border-primary-900/30 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400 font-mono">chillartrack.app/dashboard</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Monthly Budget', value: '₹5,000', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                { label: 'Spent', value: '₹2,203', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { label: 'Remaining', value: '₹2,797', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Savings', value: '₹12,500', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              ].map((stat) => (
                <div key={stat.label} className={`p-4 rounded-xl ${stat.bg}`}>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="h-3 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
              <motion.div
                className="h-full blue-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '44%' }}
                transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 dark:text-dark-muted">44% of monthly budget used</p>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="badge-blue mb-4 inline-flex">Everything you need</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-dark-text">
              Your money, <span className="gradient-text">your rules</span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-dark-muted text-lg max-w-2xl mx-auto">
              Built specifically for students and teens managing pocket money, part-time income, or allowances.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="card hover-lift group"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-dark-muted text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="badge-green mb-4 inline-flex">Real stories</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-dark-text">
              Students <span className="gradient-text">love it</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-dark-muted italic mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full blue-gradient flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-dark-text text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-dark-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 px-4 bg-slate-50 dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-slate-900 dark:text-dark-text">
              Got <span className="gradient-text">questions?</span>
            </h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="font-bold text-slate-900 dark:text-dark-text mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-dark-muted text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="blue-gradient rounded-3xl p-12 shadow-blue-glow">
            <TrendingUp className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-white mb-4">
              Start saving smarter today
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students already tracking their expenses and crushing their savings goals.
            </p>
            <Link to="/register" id="bottom-cta-btn" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors duration-200">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 dark:border-dark-border py-8 px-4 text-center text-slate-500 dark:text-dark-muted text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg blue-gradient flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-700 dark:text-dark-text">ChillarTrack</span>
        </div>
        <p>© {new Date().getFullYear()} ChillarTrack. Built with ❤️ for Gen-Z India.</p>
      </footer>
    </div>
  )
}
