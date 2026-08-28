import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { credits, CREDIT_TYPES } from '../data/mock'
import { Badge, Button, CreditTypeIcon } from '../components/ui'
function CreditCard({ credit, onNavigate }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center flex-shrink-0">
            <CreditTypeIcon type={credit.type} />
          </div>
          <div>
            <Badge label="Verified" />
          </div>
        </div>
        <button
          onClick={() => setSaved((s) => !s)}
          className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-[#5AC361]' : 'text-[#CBD5E1] hover:text-[#9CA3AF]'}`}
        >
          <svg
            className="w-4 h-4"
            fill={saved ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div>
        <h3
          className="font-semibold text-[#0F1923] text-base"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {credit.type} EPR Credits
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className="text-xl font-bold text-[#5AC361]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            ₹{credit.price}
          </span>
          <span className="text-xs text-[#6B7280]">/MT</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="font-medium text-[#374151]">{credit.quantity} MT</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{credit.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>FY {credit.complianceYear}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Valid till {credit.validTill}</span>
        </div>
      </div>

      {user?.role === 'seller' ? (
        <button
          type="button"
          disabled
          className="w-full mt-1 py-2 rounded-lg text-sm font-medium border border-[#E5EAF0] bg-[#F8FAFC] text-[#9CA3AF] cursor-not-allowed"
          title="Sellers are not authorized to request credits."
        >
          Seller accounts cannot request credits
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1 border-[#5AC361] text-[#5AC361] hover:bg-[#EBF8EC] hover:border-[#5AC361]"
          onClick={() => onNavigate('credit-detail', credit.id)}
        >
          Request This Credit
        </Button>
      )}
    </div>
  )
}
function HomePage({ onNavigate }) {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    type: '',
    minQty: '',
    maxQty: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  })
  const filtered = credits.filter((c) => {
    if (filters.type && c.type !== filters.type) return false
    if (filters.minQty && c.quantity < Number(filters.minQty)) return false
    if (filters.maxQty && c.quantity > Number(filters.maxQty)) return false
    if (filters.minPrice && c.price < Number(filters.minPrice)) return false
    if (filters.maxPrice && c.price > Number(filters.maxPrice)) return false
    if (filters.location && !c.location.toLowerCase().includes(filters.location.toLowerCase()))
      return false
    return true
  })
  const typeOptions = CREDIT_TYPES.map((t) => ({ label: t, value: t }))
  const states = [
    'Delhi',
    'Gujarat',
    'Maharashtra',
    'Tamil Nadu',
    'Rajasthan',
    'Karnataka',
    'Haryana',
    'Uttar Pradesh',
    'Punjab',
  ]
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBF8EC] rounded-full text-xs font-semibold text-[#2E7D32] mb-6 border border-[#A5D6A7]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5AC361] animate-pulse" />
                EPR Credit Marketplace — India
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold text-[#0F1923] leading-tight mb-4"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Buy &amp; Sell EPR Credits
                <br />
                <span className="text-[#5AC361]">Through Verified Deals</span>
              </h1>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                EPR Nexus acts as your trusted mediator to ensure safe, verified, and compliant
                transactions. Seller contact details are never shared directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => onNavigate('marketplace')}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Browse Credits
                </Button>
                {(user?.role === 'buyer' || !user) && (
                  <Button variant="outline" size="lg" onClick={() => onNavigate('buyer-dashboard')}>
                    Post Requirement
                  </Button>
                )}
              </div>
            </div>

            {/* Trust flow diagram */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full justify-center">
                {/* Seller */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4F8] border-2 border-[#E5EAF0] flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-[#374151]"
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
                  </div>
                  <p className="text-xs font-semibold text-[#374151] text-center">
                    Seller
                    <br />
                    <span className="text-[#9CA3AF] font-normal">Lists Credits</span>
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="w-5 h-5 text-[#CBD5E1]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className="text-[10px] text-[#9CA3AF]">Submits</span>
                </div>

                {/* EPR Nexus */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-[#EBF8EC] border-2 border-[#5AC361] flex items-center justify-center shadow-md">
                    <svg
                      className="w-7 h-7 text-[#5AC361]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-[#5AC361] text-center">
                    EPR Nexus
                    <br />
                    <span className="text-[#9CA3AF] font-normal">Mediator</span>
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="w-5 h-5 text-[#CBD5E1]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className="text-[10px] text-[#9CA3AF]">Connects</span>
                </div>

                {/* Buyer */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4F8] border-2 border-[#E5EAF0] flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-[#374151]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-[#374151] text-center">
                    Buyer
                    <br />
                    <span className="text-[#9CA3AF] font-normal">Posts Requirement</span>
                  </p>
                </div>
              </div>

              {/* Deal Closed */}
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-6 h-6 text-[#9CA3AF]">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <div className="px-5 py-2 bg-[#5AC361] rounded-full text-white text-sm font-semibold flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  Deal Closed
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                {[
                  { v: '500+', l: 'Credits Listed' },
                  { v: '\u20B95Cr+', l: 'Deals Closed' },
                  { v: '200+', l: 'Verified Sellers' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="text-center bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3"
                  >
                    <p
                      className="text-xl font-bold text-[#5AC361]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {s.v}
                    </p>
                    <p className="text-xs text-[#6B7280]">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search & Filter ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E5EAF0] sticky top-[57px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Credit Type</label>
              <select
                className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]"
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="">All Types</option>
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Quantity (MT)</label>
              <div className="flex items-center gap-1">
                <input
                  className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]"
                  placeholder="Min"
                  value={filters.minQty}
                  onChange={(e) => setFilters((f) => ({ ...f, minQty: e.target.value }))}
                />
                <span className="text-[#CBD5E1]">—</span>
                <input
                  className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]"
                  placeholder="Max"
                  value={filters.maxQty}
                  onChange={(e) => setFilters((f) => ({ ...f, maxQty: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Price (₹/MT)</label>
              <div className="flex items-center gap-1">
                <input
                  className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                />
                <span className="text-[#CBD5E1]">—</span>
                <input
                  className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Location</label>
              <select
                className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]"
                value={filters.location}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="px-4 py-2 bg-[#5AC361] hover:bg-[#3EA646] text-white rounded-lg text-sm font-medium transition-colors"
              onClick={() => {}}
            >
              Search
            </button>
            <button
              className="px-4 py-2 border border-[#E5EAF0] hover:bg-[#F0F4F8] text-[#6B7280] rounded-lg text-sm font-medium transition-colors"
              onClick={() =>
                setFilters({
                  type: '',
                  minQty: '',
                  maxQty: '',
                  minPrice: '',
                  maxPrice: '',
                  location: '',
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ─── Credits Grid ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-2xl font-bold text-[#0F1923]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Available EPR Credits
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {filtered.length} verified listings found
            </p>
          </div>
          <button
            className="text-sm text-[#5AC361] font-medium hover:underline"
            onClick={() => onNavigate('marketplace')}
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.slice(0, 8).map((c) => (
            <CreditCard key={c.id} credit={c} onNavigate={onNavigate} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#9CA3AF]">
            <p className="text-lg font-semibold text-[#374151]">No credits match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2
            className="text-2xl font-bold text-[#0F1923] text-center mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            How It Works
          </h2>
          <p className="text-[#6B7280] text-center mb-10 text-sm">
            A transparent, 5-step process from listing to deal closure
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                n: '1',
                title: 'Seller Lists Credits',
                desc: 'Seller uploads credit details + portal screenshot as proof',
                icon: (
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
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
              {
                n: '2',
                title: 'Buyer Requests',
                desc: 'Buyer shows interest in required credits with quantity & budget',
                icon: (
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
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                ),
              },
              {
                n: '3',
                title: 'We Receive & Verify',
                desc: 'EPR Nexus verifies both parties and credit authenticity',
                icon: (
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
              },
              {
                n: '4',
                title: 'We Facilitate Deal',
                desc: 'EPR Nexus negotiates & locks deal terms on behalf of both',
                icon: (
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
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                ),
              },
              {
                n: '5',
                title: 'Deal Completed',
                desc: 'Deal completed & commission recorded. Credits transferred.',
                icon: (
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
                ),
              },
            ].map((step, i) => (
              <div key={step.n} className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF8EC] border-2 border-[#5AC361] text-[#5AC361] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#5AC361] text-white text-[10px] font-bold flex items-center justify-center">
                    {step.n}
                  </div>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute mt-6 translate-x-24">
                    <svg
                      className="w-5 h-5 text-[#CBD5E1]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-semibold text-[#0F1923]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Key Features ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2
          className="text-2xl font-bold text-[#0F1923] mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Why Choose EPR Nexus
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Verified Sellers',
              desc: 'Only verified & documented sellers',
              icon: (
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
            },
            {
              title: 'Secure Transactions',
              desc: 'All deals are mediated by EPR Nexus',
              icon: (
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              ),
            },
            {
              title: 'Best Market Prices',
              desc: 'Transparent pricing & market insights',
              icon: (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ),
            },
            {
              title: 'Wide Credit Coverage',
              desc: 'All major EPR credit categories',
              icon: (
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
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
            {
              title: 'Expert Support',
              desc: 'Our team supports you every step',
              icon: (
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
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#E5EAF0] rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <p
                  className="font-semibold text-sm text-[#0F1923]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {f.title}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust & Compliance ───────────────────────────────────────── */}
      <section className="bg-[#0F1923] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                t: 'CPCB Registered Partners',
                d: 'All sellers are CPCB or state PCB registered entities',
              },
              {
                t: '100% Document Verification',
                d: 'Every listing verified against portal screenshots',
              },
              {
                t: 'Secure & Reliable Process',
                d: 'End-to-end mediation \u2014 no direct contact ever',
              },
              {
                t: 'Confidential & Transparent',
                d: 'Anonymized IDs, transparent commission structure',
              },
            ].map((t) => (
              <div key={t.t} className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5AC361] bg-opacity-20 text-[#5AC361] flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {t.t}
                </p>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sign Up CTA ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-gradient-to-br from-[#EBF8EC] to-[#F0F4F8] border border-[#A5D6A7] rounded-2xl p-10 text-center">
          <h2
            className="text-3xl font-bold text-[#0F1923] mb-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Ready to trade EPR Credits?
          </h2>
          <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
            Join EPR Nexus and be a part of India's most trusted EPR Credit Marketplace.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate('auth', void 0)}>
              Sign Up as Seller
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate('auth', void 0)}>
              Sign Up as Buyer
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
export { HomePage as default }
