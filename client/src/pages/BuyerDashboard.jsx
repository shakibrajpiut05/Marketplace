import { useEffect, useMemo, useState } from 'react'
import { CREDIT_TYPES } from '../data/mock'
import api from '../services/api.js'
import { NotificationBell, ProfileMenu } from '../components/AccountTools.jsx'
import {
  Badge,
  Button,
  Card,
  StatCard,
  Table,
  Tr,
  Td,
  Input,
  Select,
  Textarea,
} from '../components/ui'
import { MessageChat } from '../components/MessageCenter.jsx'
import { QuotationCard } from '../components/QuotationCenter.jsx'
const NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: 'requirements',
    label: 'My Requirements',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    id: 'requests',
    label: 'My Requests',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
      </svg>
    ),
  },
  {
    id: 'quotations',
    label: 'Quotations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h4m-6 4h8m-8 4h5" />
      </svg>
    ),
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]
function PostRequirementModal({ onClose, onCreated }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    type: '',
    qty: '',
    budget: '',
    location: '',
    year: '2025-26',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const states = [
    'Any Location',
    'Delhi',
    'Gujarat',
    'Maharashtra',
    'Tamil Nadu',
    'Rajasthan',
    'Karnataka',
  ]
  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-bold text-[#0F1923] mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Requirement Posted!
          </h3>
          <p className="text-sm text-[#6B7280] mb-5">
            EPR Nexus will match you with suitable verified sellers and reach out within 24–48
            hours.
          </p>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between">
          <h3
            className="text-lg font-bold text-[#0F1923]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Post a Requirement
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F0F4F8] rounded-lg text-[#6B7280]">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <Select
            label="Credit Type *"
            options={CREDIT_TYPES.map((t) => ({ label: t, value: t }))}
            placeholder="Select credit type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Required Quantity (MT) *"
              type="number"
              placeholder="e.g. 700"
              value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
            />
            <Input
              label="Budget (₹/MT) *"
              type="number"
              placeholder="e.g. 175"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            />
          </div>
          <Select
            label="Location Preference"
            options={states.map((s) => ({ label: s, value: s }))}
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Select
            label="Compliance Year *"
            options={[
              { label: 'FY 2025-26', value: '2025-26' },
              { label: 'FY 2024-25', value: '2024-25' },
            ]}
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
          />
          <Textarea
            label="Additional Notes"
            placeholder="Specific categories, timeline, etc."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          {error && (
            <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={async () => {
                if (!form.type) {
                  setError('Please select a credit type.')
                  return
                }

                if (!form.qty || Number(form.qty) <= 0) {
                  setError('Please enter a valid required quantity.')
                  return
                }

                if (!form.budget || Number(form.budget) <= 0) {
                  setError('Please enter a valid budget.')
                  return
                }

                if (!form.year) {
                  setError('Please select a compliance year.')
                  return
                }

                try {
                  setSubmitting(true)
                  setError('')

                  const response = await api.post('/requirements', {
                    type: form.type,
                    quantity: Number(form.qty),
                    budget: Number(form.budget),
                    location: form.location === 'Any Location' ? '' : form.location,
                    complianceYear: form.year,
                    notes: form.notes.trim(),
                  })

                  if (response.data.success) {
                    onCreated?.(response.data.requirement)
                    setDone(true)
                    setForm({
                      type: '',
                      qty: '',
                      budget: '',
                      location: '',
                      year: '2025-26',
                      notes: '',
                    })
                  }
                } catch (error) {
                  console.error('Post requirement error:', error)
                  setError(
                    error.response?.data?.message ||
                      'Failed to post requirement.'
                  )
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {submitting ? 'Posting...' : 'Post Requirement'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
function BuyerDashboard({ onNavigate }) {
  const [active, setActive] = useState('dashboard')
  const [showPostModal, setShowPostModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [buyerRequirements, setBuyerRequirements] = useState([])
  const [requirementLoading, setRequirementLoading] = useState(true)
  const [requirementError, setRequirementError] = useState('')

  const [buyerRequests, setBuyerRequests] = useState([])
  const [buyerDeals, setBuyerDeals] = useState([])
  const [requestLoading, setRequestLoading] = useState(true)
  const [requestError, setRequestError] = useState('')
  const [dealLoading, setDealLoading] = useState(true)
  const [dealError, setDealError] = useState('')
  const [messageUnreadCount, setMessageUnreadCount] = useState(0)
  const [messageUnreadByRequest, setMessageUnreadByRequest] = useState({})

  const fetchMessageUnread = async () => {
    try {
      const response = await api.get('/requests/messages/unread-count')
      if (response.data.success) {
        setMessageUnreadCount(Number(response.data.unreadCount || 0))
        setMessageUnreadByRequest(response.data.byRequest || {})
      }
    } catch (error) {
      console.error('Failed to fetch message unread count:', error)
    }
  }

  const markRequestMessagesRead = async (requestId) => {
    setMessageUnreadByRequest((current) => {
      const next = { ...current }
      delete next[String(requestId)]
      return next
    })
    setMessageUnreadCount((count) => Math.max(0, count - Number(messageUnreadByRequest[String(requestId)] || 0)))
  }

  const fetchBuyerData = async () => {
    try {
      setRequirementLoading(true)
      setRequestLoading(true)
      setDealLoading(true)

      setRequirementError('')
      setRequestError('')
      setDealError('')

      const [
        requirementsResponse,
        requestsResponse,
        dealsResponse,
      ] = await Promise.all([
        api.get('/requirements/buyer'),
        api.get('/requests/buyer'),
        api.get('/deals/buyer'),
      ])

      if (requirementsResponse.data.success) {
        setBuyerRequirements(
          requirementsResponse.data.requirements || []
        )
      }

      if (requestsResponse.data.success) {
        setBuyerRequests(
          requestsResponse.data.requests || []
        )
      }

      if (dealsResponse.data.success) {
        setBuyerDeals(
          dealsResponse.data.deals || []
        )
      }
    } catch (error) {
      console.error(
        'Failed to fetch buyer dashboard data:',
        error
      )

      const message =
        error.response?.data?.message ||
        'Failed to load buyer data.'

      setRequirementError(message)
      setRequestError(message)
      setDealError(message)
    } finally {
      setRequirementLoading(false)
      setRequestLoading(false)
      setDealLoading(false)
    }
  }

  useEffect(() => {
    fetchBuyerData()
    fetchMessageUnread()
    const interval = window.setInterval(fetchMessageUnread, 10000)
    return () => window.clearInterval(interval)
  }, [])

  const openReqs = useMemo(
    () =>
      buyerRequirements.filter(
        (requirement) =>
          ['open', 'matching', 'matched'].includes(
            requirement.status
          )
      ).length,
    [buyerRequirements],
  )

  const requestsSent = buyerRequests.length
  const dealsInProgress = buyerDeals.filter(
    (deal) => !['completed', 'cancelled'].includes(deal.status),
  ).length
  const completedDeals = buyerDeals.filter((deal) => deal.status === 'completed').length
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {showPostModal && (
        <PostRequirementModal
          onClose={() => setShowPostModal(false)}
          onCreated={(createdRequirement) => {
            setBuyerRequirements((current) => [
              createdRequirement,
              ...current,
            ])
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-[#E5EAF0] flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex`}
      >
        <div className="px-4 py-4 border-b border-[#E5EAF0] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5AC361] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-sm font-bold text-[#0F1923]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              EPR Nexus
            </p>
            <p className="text-[10px] text-[#6B7280]">Buyer Portal</p>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-[#374151]">ABC Motors Ltd.</p>
              <p className="text-[10px] text-[#9CA3AF]">Buyer #112</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setActive(n.id)
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${active === n.id ? 'bg-[#EBF8EC] text-[#2E7D32]' : 'text-[#6B7280] hover:bg-[#F7F9FB] hover:text-[#374151]'}`}
            >
              <span className="flex items-center gap-2.5">{n.icon}{n.label}</span>
              {(n.id === 'quotations' ? buyerRequests.filter((request) => request.offer?.finalAmount != null && !request.offer?.acceptedAt).length : n.id === 'messages' ? messageUnreadCount : 0) > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === n.id ? 'bg-white/60 text-[#2E7D32]' : 'bg-[#EF4444] text-white'}`}>
                  {n.id === 'quotations' ? buyerRequests.filter((request) => request.offer?.finalAmount != null && !request.offer?.acceptedAt).length : messageUnreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-[#E5EAF0]">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#EF4444] hover:bg-[#FEF2F2] w-full transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Home
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">
        <div className="bg-white border-b border-[#E5EAF0] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 hover:bg-[#F0F4F8] rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="w-5 h-5 text-[#6B7280]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1
              className="text-base font-semibold text-[#0F1923]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {NAV.find((n) => n.id === active)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onNavigate('home')}>Home</Button>
            <NotificationBell compact onNavigate={onNavigate} />
            <ProfileMenu compact onNavigate={onNavigate} />
            <Button size="sm" variant="outline" onClick={() => onNavigate('marketplace')}>
              Browse Credits
            </Button>
            <Button size="sm" onClick={() => setShowPostModal(true)}>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Post Requirement
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-6xl">
          {active === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Active Requirements"
                  value={openReqs}
                  accent
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Requests Sent"
                  value={requestsSent}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Deals in Progress"
                  value={dealsInProgress}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Completed Deals"
                  value={completedDeals}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-semibold text-[#0F1923]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  My Recent Requirements
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setActive('requirements')}>
                    View All
                  </Button>
                  <Button size="sm" onClick={() => setShowPostModal(true)}>
                    + Post Requirement
                  </Button>
                </div>
              </div>

              <Card>
                <Table
                  headers={['Credit Type', 'Required Qty', 'Budget (\u20B9/MT)', 'Year', 'Status']}
                >
                  {requirementLoading ? (
                    <Tr>
                      <Td colSpan={5}>
                        <div className="py-8 text-center text-[#9CA3AF]">
                          Loading requirements...
                        </div>
                      </Td>
                    </Tr>
                  ) : requirementError ? (
                    <Tr>
                      <Td colSpan={5}>
                        <div className="py-8 text-center text-[#EF4444]">
                          {requirementError}
                        </div>
                      </Td>
                    </Tr>
                  ) : buyerRequirements.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}>
                        <div className="py-8 text-center text-[#9CA3AF]">
                          No requirements yet.
                        </div>
                      </Td>
                    </Tr>
                  ) : (
                    buyerRequirements.slice(0, 5).map((requirement) => (
                      <Tr key={requirement._id}>
                        <Td>
                          <span className="font-medium">
                            {requirement.type || '—'}
                          </span>
                        </Td>
                        <Td>{Number(requirement.quantity || 0).toLocaleString('en-IN')} MT</Td>
                        <Td>₹{Number(requirement.budget || 0).toLocaleString('en-IN')}</Td>
                        <Td>{requirement.complianceYear || '—'}</Td>
                        <Td>
                          <Badge label={requirement.status} />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Table>
              </Card>

              {/* Confidentiality notice */}
              <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm text-[#1D4ED8]">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Contact details are hidden. All communication is routed through EPR Nexus. You are
                identified as <strong className="mx-1">Buyer #112</strong> on the marketplace.
              </div>
            </>
          )}

          {active === 'requirements' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    All My Requirements
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Requirements you have posted for EPR credits.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowPostModal(true)}
                >
                  + Post Requirement
                </Button>
              </div>

              {requirementLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading your requirements...
                </div>
              ) : requirementError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {requirementError}
                </div>
              ) : buyerRequirements.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  <p className="text-lg font-semibold text-[#374151]">
                    No requirements yet
                  </p>
                  <p className="text-sm mt-1">
                    Post a requirement and EPR Nexus will help match it with verified sellers.
                  </p>
                </div>
              ) : (
                <Table
                  headers={[
                    'Credit Type',
                    'Required Qty',
                    'Budget (₹/MT)',
                    'Location Pref.',
                    'Year',
                    'Notes',
                    'Status',
                    'Posted On',
                  ]}
                >
                  {buyerRequirements.map((requirement) => (
                    <Tr key={requirement._id}>
                      <Td>
                        <span className="font-medium">
                          {requirement.type}
                        </span>
                      </Td>
                      <Td>
                        {Number(requirement.quantity || 0).toLocaleString(
                          'en-IN'
                        )}{' '}
                        MT
                      </Td>
                      <Td>
                        ₹{Number(requirement.budget || 0).toLocaleString(
                          'en-IN'
                        )}
                      </Td>
                      <Td>
                        {requirement.location || 'Any Location'}
                      </Td>
                      <Td>
                        {requirement.complianceYear || '—'}
                      </Td>
                      <Td className="max-w-[220px]">
                        <span className="truncate block text-[#6B7280] text-xs">
                          {requirement.notes || '—'}
                        </span>
                      </Td>
                      <Td>
                        <Badge
                          label={requirement.status}
                        />
                      </Td>
                      <Td>
                        {requirement.createdAt
                          ? new Date(
                              requirement.createdAt
                            ).toLocaleDateString('en-IN')
                          : '—'}
                      </Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {active === 'requests' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    My Requests
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Track purchase requests managed by EPR Nexus.
                  </p>
                </div>
                <Badge label={`${buyerRequests.length} Requests`} />
              </div>

              {requestLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading your requests...
                </div>
              ) : requestError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {requestError}
                </div>
              ) : buyerRequests.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  <p className="text-lg font-semibold text-[#374151]">
                    No requests yet
                  </p>
                  <p className="text-sm mt-1">
                    Your purchase requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {buyerRequests.map((request) => (
                    <div key={request._id} className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-4">
                            <h3
                              className="font-semibold text-[#0F1923]"
                              style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                              {request.listing?.category || 'EPR Credit'}
                            </h3>
                            <Badge label={request.status} />
                          </div>

                          <div className="mb-4">
                            <MessageChat requestId={request._id} role="buyer" compact onRead={markRequestMessagesRead} />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Requested Quantity</p>
                              <p className="font-medium text-[#374151]">
                                {request.requestedQuantity ?? 0} MT
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Listing Price</p>
                              <p className="font-medium text-[#374151]">
                                ₹{request.listing?.price ?? '—'} / MT
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Compliance Year</p>
                              <p className="font-medium text-[#374151]">
                                FY {request.listing?.complianceYear || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Location</p>
                              <p className="font-medium text-[#374151]">
                                {request.listing?.location || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Submitted</p>
                              <p className="font-medium text-[#374151]">
                                {request.createdAt
                                  ? new Date(request.createdAt).toLocaleDateString('en-IN')
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Valid Till</p>
                              <p className="font-medium text-[#374151]">
                                {request.listing?.validTill
                                  ? new Date(request.listing.validTill).toLocaleDateString('en-IN')
                                  : '—'}
                              </p>
                            </div>
                          </div>

                          {request.notes && (
                            <div className="mt-4 p-3 bg-[#F7F9FB] rounded-lg">
                              <p className="text-xs text-[#9CA3AF] mb-1">
                                Your Notes
                              </p>
                              <p className="text-sm text-[#374151]">
                                {request.notes}
                              </p>
                            </div>
                          )}

                          {request.rejectionReason && (
                            <div className="mt-3 p-3 bg-[#FEF2F2] rounded-lg">
                              <p className="text-xs font-semibold text-[#991B1B]">
                                Rejection Reason
                              </p>
                              <p className="text-sm text-[#B91C1C] mt-1">
                                {request.rejectionReason}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                            <p className="text-xs text-[#1D4ED8]">
                              EPR Nexus manages all buyer-seller communication.
                              Seller contact details remain confidential.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {active === 'quotations' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]">
                <h2 className="font-semibold text-[#0F1923]">Quotations</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Review commercial offers issued by EPR Nexus. Accepting a quotation creates a deal with payment still pending.</p>
              </div>
              <div className="divide-y divide-[#E5EAF0]">
                {buyerRequests.filter((request) => request.offer?.finalAmount != null).length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#9CA3AF]">No quotations yet.</div>
                ) : buyerRequests.filter((request) => request.offer?.finalAmount != null).map((request) => (
                  <div key={request._id} className="p-5 grid lg:grid-cols-[1fr_380px] gap-5 items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[#0F1923]">{request.listing?.category || 'EPR Credit'}</h3>
                        <Badge label={request.offer?.acceptedAt ? 'Accepted' : 'Action required'} />
                      </div>
                      <p className="text-sm text-[#6B7280]">{request.requestedQuantity || 0} MT · Request #{request._id.slice(-6)}</p>
                      <p className="text-xs text-[#9CA3AF] mt-2">Quotation #{request.offer.version} · Issued {request.offer.sentAt ? new Date(request.offer.sentAt).toLocaleString('en-IN') : '—'}</p>
                      {!request.offer?.acceptedAt ? <p className="text-xs text-[#52606D] mt-3">Need a change? Open Messages and ask EPR Nexus. The quotation itself can only be changed by EPR Nexus.</p> : <p className="text-xs text-[#2E7D32] mt-3">Accepted does not mean payment received. Track payment in My Deals.</p>}
                    </div>
                    <div>
                      <QuotationCard request={request} onAccept={async () => { try { const response = await api.post(`/requests/${request._id}/accept-offer`); if (response.data.success) await fetchBuyerData() } catch (error) { alert(error.response?.data?.message || 'Unable to accept this quotation.') } }} accepting={false} />
                      <div className="mt-2"><MessageChat requestId={request._id} role="buyer" compact onRead={markRequestMessagesRead} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === 'deals' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    My Deals
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Track transactions managed by EPR Nexus.
                  </p>
                </div>
                <Badge label={`${buyerDeals.length} Deals`} />
              </div>

              {dealLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading your deals...
                </div>
              ) : dealError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {dealError}
                </div>
              ) : buyerDeals.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  <p className="text-lg font-semibold text-[#374151]">
                    No deals yet
                  </p>
                  <p className="text-sm mt-1">
                    Completed and in-progress transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {buyerDeals.map((deal) => {
                    const stages = [
                      { key: 'matched', label: 'Matched' },
                      { key: 'terms_agreed', label: 'Quotation Accepted' },
                      { key: 'payment_coordination', label: 'Payment Coordination' },
                      { key: 'completed', label: 'Completed' },
                    ]
                    const order = stages.map((stage) => stage.key)
                    const currentIndex = order.indexOf(deal.status)
                    const totalValue = Number(deal.quantity || 0) * Number(deal.agreedPrice || 0)

                    return (
                      <div key={deal._id} className="p-5">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                              <h3
                                className="font-semibold text-[#0F1923]"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                {deal.listing?.category || 'EPR Credit Deal'}
                              </h3>
                              <Badge label={deal.status.replaceAll('_', ' ')} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Quantity</p>
                                <p className="font-medium text-[#374151]">{deal.quantity} MT</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Agreed Price</p>
                                <p className="font-medium text-[#374151]">₹{deal.agreedPrice} / MT</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Credit Value</p>
                                <p className="font-semibold text-[#5AC361]">₹{Number(deal.creditSubtotal ?? totalValue).toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">EPR Nexus Fee</p>
                                <p className="font-medium text-[#374151]">₹{Number(deal.serviceFee ?? deal.commissionAmount ?? 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Total Payable</p>
                                <p className="font-semibold text-[#0F1923]">₹{Number(deal.finalAmount ?? (totalValue + Number(deal.serviceFee ?? deal.commissionAmount ?? 0))).toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Payment</p>
                                <p className="font-medium text-[#374151] capitalize">{deal.paymentStatus || 'pending'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Location</p>
                                <p className="font-medium text-[#374151]">{deal.listing?.location || '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#9CA3AF]">Compliance Year</p>
                                <p className="font-medium text-[#374151]">FY {deal.listing?.complianceYear || '—'}</p>
                              </div>
                            </div>

                            <div className="mt-4 p-4 bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl">
                              <p className="text-xs font-semibold text-[#6B7280] mb-3 uppercase tracking-wide">
                                Deal Progress
                              </p>
                              <div className="flex items-center gap-1 overflow-x-auto">
                                {stages.map((stage, index) => {
                                  const done = currentIndex >= index
                                  return (
                                    <div key={stage.key} className="flex items-center gap-1 shrink-0">
                                      <div
                                        className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
                                          done ? 'bg-[#5AC361] text-white' : 'bg-[#F0F4F8] text-[#9CA3AF]'
                                        }`}
                                      >
                                        {stage.label}
                                      </div>
                                      {index < stages.length - 1 && (
                                        <div className={`w-3 h-0.5 ${done ? 'bg-[#5AC361]' : 'bg-[#E5EAF0]'}`} />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                              <p className="text-xs text-[#1D4ED8]">
                                EPR Nexus manages the transaction, payment coordination, and seller communication.
                              </p>
                            </div>

                            {deal.notes && (
                              <div className="mt-3">
                                <p className="text-xs text-[#9CA3AF]">Deal Notes</p>
                                <p className="text-sm text-[#374151] mt-1">{deal.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )}

          {active === 'messages' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]"><h2 className="font-semibold text-[#0F1923]">Messages</h2><p className="text-xs text-[#9CA3AF] mt-1">Private communication with EPR Nexus. Quotations are shown separately in Quotations.</p></div>
              {buyerRequests.length === 0 ? <div className="py-16 text-center text-sm text-[#9CA3AF]">No conversations yet.</div> : <div className="divide-y divide-[#E5EAF0]">{buyerRequests.map((request) => { const unread = Number(messageUnreadByRequest[String(request._id)] || 0); return <div key={request._id} className={`p-5 flex items-center justify-between gap-4 ${unread ? 'bg-[#F0FBF1]' : ''}`}><div><div className="flex items-center gap-2"><p className="font-semibold text-[#0F1923]">{request.listing?.category || 'Credit request'}</p>{unread > 0 && <span className="w-2 h-2 rounded-full bg-[#EF4444]" title="Unread messages" />}</div><p className="text-xs text-[#6B7280] mt-1">{request.requestedQuantity || 0} MT · {unread ? `${unread} unread message${unread === 1 ? '' : 's'}` : 'No unread messages'}</p></div><MessageChat requestId={request._id} role="buyer" compact onRead={markRequestMessagesRead} /></div> })}</div>}
            </Card>
          )}

          {active === 'profile' && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]">
                <h2 className="font-semibold text-[#0F1923]">Profile</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Manage your account details and verification status.</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-[#6B7280]">Use the profile menu in the top navigation to view or edit your account details, verification status, and logout.</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
export { BuyerDashboard as default }