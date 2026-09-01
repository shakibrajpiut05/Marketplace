import { useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MarketplacePage from './pages/MarketplacePage'
import CreditDetailPage from './pages/CreditDetailPage'
import AuthPage from './pages/AuthPage'
import SellerDashboard from './pages/SellerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AddListingPage from './pages/AddListingPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import SignupEmailPendingPage from './pages/SignupEmailPendingPage'
import GoogleSignupPhonePage from './pages/GoogleSignupPhonePage'
import VerificationPage from './pages/VerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { useAuth } from './context/AuthContext.jsx'
import { NotificationBell, ProfileMenu, AdminProfileMenu } from './components/AccountTools.jsx'

const DASHBOARD_PATHS = ['/seller', '/buyer', '/admin', '/seller/listings/new', '/verification']

const getDashboardPathForRole = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'seller') return '/seller'
  if (role === 'buyer') return '/buyer'
  return '/login'
}

const getPageKey = (pathname) => {
  if (pathname === '/marketplace') return 'marketplace'
  if (pathname.startsWith('/credits/')) return 'credit-detail'
  if (pathname === '/login') return 'auth'
  if (pathname === '/signup') return 'auth-signup'
  if (pathname === '/forgot-password') return 'forgot-password'
  if (pathname.startsWith('/reset-password/')) return 'reset-password'
  if (pathname === '/email-pending') return 'email-pending'
  if (pathname.startsWith('/verify-email/')) return 'email-verification'
  if (pathname === '/google-signup-phone') return 'google-signup-phone'
  if (pathname === '/verification') return 'verification'
  if (pathname === '/seller') return 'seller-dashboard'
  if (pathname === '/buyer') return 'buyer-dashboard'
  if (pathname === '/admin') return 'admin-dashboard'
  if (pathname === '/seller/listings/new') return 'add-listing'
  return 'home'
}

function BrandMark({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-[#5AC361] shadow-[0_4px_12px_rgba(90,195,97,0.20)]`}
      aria-hidden="true"
    >
      <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
  )
}

function Navbar({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (DASHBOARD_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))) {
    return null
  }

  const dashboardPage = user?.role === 'admin' ? 'admin-dashboard' : user?.role === 'seller' ? 'seller-dashboard' : 'buyer-dashboard'
  const publicLinks = [
    { label: 'Marketplace', page: 'marketplace' },
    ...(user?.role === 'buyer' || !isAuthenticated ? [{ label: 'Post Requirement', page: 'buyer-dashboard' }] : []),
    { label: 'How It Works', page: 'home' },
    { label: 'About Us', page: 'home' },
  ]

  const handleNavigate = (target, id) => {
    setMenuOpen(false)
    onNavigate(target, id)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5EAF0]/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => handleNavigate('home')} className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] focus-visible:ring-offset-2" aria-label="EPR Nexus home">
          <BrandMark />
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate font-heading text-sm font-bold leading-none tracking-[-0.01em] text-[#0F1923]">EPR Nexus</p>
            <p className="mt-1 truncate text-[10px] leading-none text-[#8A94A3]">Connecting Value. Ensuring Compliance.</p>
          </div>
        </button>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary navigation">
          {publicLinks.map((link) => {
            const isActive = page === link.page && link.page !== 'home'
            return (
              <button key={link.label} type="button" onClick={() => handleNavigate(link.page)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] focus-visible:ring-offset-1 ${isActive ? 'bg-[#F0FBF1] text-[#2E7D32]' : 'text-[#667085] hover:bg-[#F7F9FB] hover:text-[#1F2937]'}`}>
                {link.label}
              </button>
            )
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          {!isAuthenticated ? (
            <>
              <button type="button" onClick={() => handleNavigate('auth')} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#475467] transition-colors hover:bg-[#F7F9FB] hover:text-[#0F1923] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361]">Log in</button>
              <button type="button" onClick={() => handleNavigate('auth-signup')} className="rounded-lg bg-[#5AC361] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3EA646] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] focus-visible:ring-offset-2">Get started</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => handleNavigate(dashboardPage)} className="rounded-lg bg-[#5AC361] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3EA646] hover:shadow-md">Dashboard</button>
              <NotificationBell compact onNavigate={onNavigate} />
              {user?.role === 'admin' ? <AdminProfileMenu onNavigate={onNavigate} compact /> : <ProfileMenu onNavigate={onNavigate} compact />}
            </>
          )}
        </div>

        <button type="button" className="rounded-lg p-2 text-[#667085] transition-colors hover:bg-[#F7F9FB] hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#E5EAF0] bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6" aria-label="Mobile navigation">
            {publicLinks.map((link) => (
              <button key={link.label} type="button" onClick={() => handleNavigate(link.page)} className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${page === link.page && link.page !== 'home' ? 'bg-[#F0FBF1] text-[#2E7D32]' : 'text-[#475467] hover:bg-[#F7F9FB]'}`}>{link.label}</button>
            ))}
            {isAuthenticated ? (
              <button type="button" onClick={() => { setMenuOpen(false); handleNavigate(dashboardPage) }} className="mt-2 rounded-lg bg-[#5AC361] px-3 py-2.5 text-left text-sm font-semibold text-white">Open dashboard</button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#E5EAF0] pt-3">
                <button type="button" onClick={() => handleNavigate('auth')} className="rounded-lg border border-[#E5EAF0] px-3 py-2.5 text-sm font-semibold text-[#475467]">Log in</button>
                <button type="button" onClick={() => handleNavigate('auth-signup')} className="rounded-lg bg-[#5AC361] px-3 py-2.5 text-sm font-semibold text-white">Get started</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

function PublicFooter({ user, onNavigate }) {
  return (
    <footer className="mt-auto bg-[#101820] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]">
              <BrandMark size="sm" /><span className="font-heading text-sm font-bold">EPR Nexus</span>
            </button>
            <p className="mt-4 text-sm leading-6 text-white/55">India's B2B EPR credit marketplace for verified buyers and sellers, with mediated transactions and compliance-focused workflows.</p>
          </div>
          {[
            { title: 'Platform', links: [{ label: 'Browse Credits', page: 'marketplace' }, ...(user?.role === 'seller' || user?.role === 'admin' ? [] : [{ label: 'Post Requirement', page: 'buyer-dashboard' }]), { label: 'How It Works', page: 'home' }] },
            { title: 'Company', links: [{ label: 'About Us', page: 'home' }, { label: 'Contact', page: 'home' }, { label: 'Careers', page: 'home' }] },
            { title: 'Legal', links: [{ label: 'Privacy Policy', page: 'home' }, { label: 'Terms of Service', page: 'home' }, { label: 'Compliance', page: 'home' }] },
          ].map((column) => (
            <div key={column.title}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{column.title}</p><ul className="mt-4 space-y-2.5">{column.links.map((link) => <li key={link.label}><button type="button" onClick={() => onNavigate(link.page)} className="text-sm text-white/45 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361]">{link.label}</button></li>)}</ul></div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} EPR Nexus. All rights reserved.</p><p>Made in India 🇮🇳 · Compliance-focused B2B marketplace</p></div>
      </div>
    </footer>
  )
}


function RouterApp() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const page = getPageKey(location.pathname)

  const legacyNavigate = (target, id) => {
    const paths = {
      home: '/', marketplace: '/marketplace', auth: '/login', 'auth-signup': '/signup',
      'forgot-password': '/forgot-password', 'email-pending': '/email-pending',
      'google-signup-phone': '/google-signup-phone', verification: '/verification',
      'seller-dashboard': '/seller', 'buyer-dashboard': '/buyer', 'admin-dashboard': '/admin',
      'add-listing': '/seller/listings/new',
    }

    if (target === 'credit-detail' && id) return navigate(`/credits/${encodeURIComponent(id)}`)

    // Deep-link dashboard actions from notifications without losing the user's context.
    if (target === 'deal-room' && id) {
      const dashboardPath =
        user?.role === 'seller' ? '/seller' :
        user?.role === 'admin' ? '/admin' : '/buyer'
      return navigate(`${dashboardPath}?section=deals&deal=${encodeURIComponent(id)}`)
    }
    if (target === 'dashboard-section' && id) {
      const dashboardPath =
        user?.role === 'seller' ? '/seller' :
        user?.role === 'admin' ? '/admin' : '/buyer'
      return navigate(`${dashboardPath}?section=${encodeURIComponent(id)}`)
    }

    let path = paths[target] || '/'
    if (['/seller', '/seller/listings/new'].includes(path) && user?.role !== 'seller') path = user ? getDashboardPathForRole(user.role) : '/login'
    if (path === '/buyer' && user?.role !== 'buyer') path = user ? getDashboardPathForRole(user.role) : '/login'
    if (path === '/admin' && user?.role !== 'admin') path = user ? getDashboardPathForRole(user.role) : '/login'
    if (path === '/verification' && (!user || !['buyer', 'seller'].includes(user.role))) path = user ? getDashboardPathForRole(user.role) : '/login'
    if (path === '/login' && user) path = getDashboardPathForRole(user.role)
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F9FB] px-4"><div className="flex flex-col items-center gap-3 text-center"><BrandMark /><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7DEE7] border-t-[#5AC361]" /><p className="text-sm text-[#667085]">Loading EPR Nexus…</p></div></div>
  }

  const isDashboard = DASHBOARD_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB]">
      <Navbar page={page} onNavigate={legacyNavigate} />
      <main className="min-w-0 flex-1">
        <Routes>
          <Route path="/" element={<RootRoute onNavigate={legacyNavigate} />} />
          <Route path="/marketplace" element={<HomeRoute component={MarketplacePage} onNavigate={legacyNavigate} />} />
          <Route path="/credits/:creditId" element={<CreditRoute onNavigate={legacyNavigate} />} />
          <Route path="/login" element={<AuthRoute initialMode="login" onNavigate={legacyNavigate} />} />
          <Route path="/signup" element={<AuthRoute initialMode="signup" onNavigate={legacyNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={legacyNavigate} />} />
          <Route path="/reset-password/:token" element={<ResetRoute onNavigate={legacyNavigate} />} />
          <Route path="/email-pending" element={<SignupEmailPendingPage onNavigate={legacyNavigate} />} />
          <Route path="/verify-email/:token" element={<VerificationRoute />} />
          <Route path="/google-signup-phone" element={<GoogleSignupPhonePage onNavigate={legacyNavigate} />} />
          <Route path="/verification" element={<RoleRoute allowedRoles={['buyer', 'seller']}><VerificationPage onNavigate={legacyNavigate} /></RoleRoute>} />
          <Route path="/seller" element={<RoleRoute allowedRoles={['seller']}><SellerDashboard onNavigate={legacyNavigate} /></RoleRoute>} />
          <Route path="/seller/listings/new" element={<RoleRoute allowedRoles={['seller']}><AddListingPage onNavigate={legacyNavigate} /></RoleRoute>} />
          <Route path="/buyer" element={<RoleRoute allowedRoles={['buyer']}><BuyerDashboard onNavigate={legacyNavigate} /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard onNavigate={legacyNavigate} /></RoleRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isDashboard && <PublicFooter user={user} onNavigate={legacyNavigate} />}
    </div>
  )
}

function HomeRoute({ component: Component, onNavigate }) { return <Component onNavigate={onNavigate} /> }
function CreditRoute({ onNavigate }) { const { creditId } = useParams(); return <CreditDetailPage creditId={creditId} onNavigate={onNavigate} /> }
function ResetRoute({ onNavigate }) { const { token } = useParams(); return <ResetPasswordPage token={token} onNavigate={onNavigate} /> }
function VerificationRoute() { const { token } = useParams(); const navigate = useNavigate(); return <EmailVerificationPage token={token} onNavigate={(target, id) => { if (target === 'credit-detail' && id) return navigate(`/credits/${encodeURIComponent(id)}`); navigate(target === 'home' ? '/' : '/login'); }} /> }
function AuthRoute({ initialMode, onNavigate }) { const { user } = useAuth(); if (user) return <Navigate to={getDashboardPathForRole(user.role)} replace />; return <AuthPage initialMode={initialMode} onNavigate={onNavigate} /> }
function RoleRoute({ allowedRoles, children }) { const { user } = useAuth(); if (!user) return <Navigate to="/login" replace />; if (!allowedRoles.includes(user.role)) return <Navigate to={getDashboardPathForRole(user.role)} replace />; return children }

function RootRoute({ onNavigate }) {
  const [searchParams] = useSearchParams()
  const verify = searchParams.get('verify-email')
  const reset = searchParams.get('reset-password')

  if (verify) return <Navigate to={`/verify-email/${encodeURIComponent(verify)}`} replace />
  if (reset) return <Navigate to={`/reset-password/${encodeURIComponent(reset)}`} replace />

  return <HomePage onNavigate={onNavigate} />
}

export default function App() {
  return <BrowserRouter><RouterApp /></BrowserRouter>
}
