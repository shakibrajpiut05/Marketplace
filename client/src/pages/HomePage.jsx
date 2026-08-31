import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Badge, Button, CreditTypeIcon } from '../components/ui'
import api from '../services/api.js'

const STATES = [
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

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CreditCard({ listing, onNavigate }) {
  const { user } = useAuth()
  const price = Number(listing.price || 0)
  const quantity = Number(listing.quantity || 0)

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center flex-shrink-0">
            <CreditTypeIcon type={listing.category} />
          </div>
          <Badge label="Verified" />
        </div>
        <span className="text-[11px] font-medium text-[#667085]">Live listing</span>
      </div>

      <div>
        <h3 className="font-semibold text-[#0F1923] text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {listing.category || 'EPR Credit'} EPR Credits
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-[#5AC361]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-[#6B7280]">/MT</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-[#6B7280]">
          <span className="block text-[#9CA3AF]">Available</span>
          <span className="font-medium text-[#374151]">{quantity.toLocaleString('en-IN')} MT</span>
        </div>
        <div className="text-[#6B7280]">
          <span className="block text-[#9CA3AF]">Location</span>
          <span className="font-medium text-[#374151] truncate block">{listing.location || '—'}</span>
        </div>
        <div className="text-[#6B7280]">
          <span className="block text-[#9CA3AF]">Compliance</span>
          <span className="font-medium text-[#374151]">{listing.complianceYear || '—'}</span>
        </div>
        <div className="text-[#6B7280]">
          <span className="block text-[#9CA3AF]">Valid till</span>
          <span className="font-medium text-[#374151]">{formatDate(listing.validTill)}</span>
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
          className="w-full mt-1 border-[#5AC361] text-[#5AC361] hover:bg-[#EBF8EC]"
          onClick={() => onNavigate('credit-detail', listing._id)}
        >
          View &amp; Request
        </Button>
      )}
    </div>
  )
}

function HomePage({ onNavigate }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    minQty: '',
    maxQty: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  })

  useEffect(() => {
    let cancelled = false

    const loadListings = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/listings')
        if (!cancelled) {
          setListings(response.data?.success ? response.data.listings || [] : [])
          if (!response.data?.success) setError('Unable to load live marketplace listings.')
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load home listings:', err)
          setListings([])
          setError(err.response?.data?.message || 'Marketplace listings are temporarily unavailable.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadListings()
    return () => {
      cancelled = true
    }
  }, [])

  const types = useMemo(
    () => Array.from(new Set(listings.map((listing) => listing.category).filter(Boolean))).sort(),
    [listings],
  )

  const filtered = useMemo(
    () => listings.filter((listing) => {
      if (filters.type && listing.category !== filters.type) return false
      if (filters.minQty && Number(listing.quantity || 0) < Number(filters.minQty)) return false
      if (filters.maxQty && Number(listing.quantity || 0) > Number(filters.maxQty)) return false
      if (filters.minPrice && Number(listing.price || 0) < Number(filters.minPrice)) return false
      if (filters.maxPrice && Number(listing.price || 0) > Number(filters.maxPrice)) return false
      if (filters.location && !String(listing.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false
      return true
    }),
    [listings, filters],
  )

  const totalAvailable = listings.reduce((sum, listing) => sum + Number(listing.quantity || 0), 0)
  const creditTypeCount = new Set(listings.map((listing) => listing.category).filter(Boolean)).size

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <section className="bg-white border-b border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBF8EC] rounded-full text-xs font-semibold text-[#2E7D32] mb-6 border border-[#A5D6A7]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5AC361] animate-pulse" />
                EPR Credit Marketplace — India
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F1923] leading-tight mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Buy &amp; Sell EPR Credits
                <br />
                <span className="text-[#5AC361]">Through Verified Deals</span>
              </h1>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                EPR Nexus connects verified buyers and sellers through a mediated, compliance-focused transaction process.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => onNavigate('marketplace')}>Browse Credits</Button>
                {user?.role === 'buyer' && (
                  <Button variant="outline" size="lg" onClick={() => onNavigate('buyer-dashboard')}>Post Requirement</Button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full rounded-2xl bg-[#F7F9FB] border border-[#E5EAF0] p-6">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Live marketplace</p>
                    <p className="text-sm text-[#374151] mt-1">Real-time availability from approved listings</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center">✓</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-white border border-[#E5EAF0] rounded-xl p-3">
                    <p className="text-xl font-bold text-[#5AC361]">{loading ? '—' : listings.length}</p>
                    <p className="text-xs text-[#6B7280]">Live listings</p>
                  </div>
                  <div className="text-center bg-white border border-[#E5EAF0] rounded-xl p-3">
                    <p className="text-xl font-bold text-[#5AC361]">{loading ? '—' : totalAvailable.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#6B7280]">Available MT</p>
                  </div>
                  <div className="text-center bg-white border border-[#E5EAF0] rounded-xl p-3">
                    <p className="text-xl font-bold text-[#5AC361]">{loading ? '—' : creditTypeCount}</p>
                    <p className="text-xs text-[#6B7280]">Credit types</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] text-center">Availability shown here comes from the marketplace API, not sample data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-[#E5EAF0] sticky top-[57px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Credit Type</label>
              <select className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                <option value="">All Types</option>
                {types.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Quantity (MT)</label>
              <div className="flex items-center gap-1">
                <input className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]" placeholder="Min" value={filters.minQty} onChange={(e) => setFilters((f) => ({ ...f, minQty: e.target.value }))} />
                <span className="text-[#CBD5E1]">—</span>
                <input className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]" placeholder="Max" value={filters.maxQty} onChange={(e) => setFilters((f) => ({ ...f, maxQty: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Price (₹/MT)</label>
              <div className="flex items-center gap-1">
                <input className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} />
                <span className="text-[#CBD5E1]">—</span>
                <input className="px-2 py-2 border border-[#E5EAF0] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#5AC361]" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">Location</label>
              <select className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}>
                <option value="">All States</option>
                {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <button type="button" className="px-4 py-2 border border-[#E5EAF0] hover:bg-[#F0F4F8] text-[#6B7280] rounded-lg text-sm font-medium transition-colors" onClick={() => setFilters({ type: '', minQty: '', maxQty: '', minPrice: '', maxPrice: '', location: '' })}>Reset</button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F1923]" style={{ fontFamily: 'Outfit, sans-serif' }}>Available EPR Credits</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">{loading ? 'Loading live listings…' : `${filtered.length} live listings found`}</p>
          </div>
          <button type="button" className="text-sm text-[#5AC361] font-medium hover:underline" onClick={() => onNavigate('marketplace')}>View All →</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 bg-white border border-[#E5EAF0] rounded-xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center py-14 bg-white border border-[#E5EAF0] rounded-xl">
            <p className="text-lg font-semibold text-[#374151]">Marketplace unavailable</p>
            <p className="text-sm mt-1 text-[#6B7280]">{error}</p>
            <Button variant="outline" size="sm" className="mt-5" onClick={() => onNavigate('marketplace')}>Open Marketplace</Button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.slice(0, 8).map((listing) => <CreditCard key={listing._id} listing={listing} onNavigate={onNavigate} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[#E5EAF0] rounded-xl">
            <p className="text-lg font-semibold text-[#374151]">No live credits match your filters</p>
            <p className="text-sm mt-1 text-[#6B7280]">Try adjusting your search criteria or browse the full marketplace.</p>
          </div>
        )}
      </section>

      <section className="bg-white border-y border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl font-bold text-[#0F1923] text-center mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>How It Works</h2>
          <p className="text-[#6B7280] text-center mb-10 text-sm">A transparent process from listing to deal closure</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              ['1', 'Seller Lists Credits', 'Seller submits credit details and supporting documentation.'],
              ['2', 'Buyer Requests', 'Buyer selects suitable credits and submits a purchase request.'],
              ['3', 'We Verify', 'EPR Nexus verifies parties, listings and supporting documents.'],
              ['4', 'We Facilitate', 'Terms are negotiated and recorded through the platform.'],
              ['5', 'Deal Completed', 'Payment is confirmed and the transaction is closed.'],
            ].map(([number, title, description]) => (
              <div key={number} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF8EC] border-2 border-[#5AC361] text-[#5AC361] flex items-center justify-center font-bold">{number}</div>
                <div><p className="text-sm font-semibold text-[#0F1923]" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p><p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-bold text-[#0F1923] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Why Choose EPR Nexus</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            ['Verified Sellers', 'Documented seller and listing verification'],
            ['Secure Transactions', 'Mediated transaction workflow'],
            ['Transparent Pricing', 'Clear listing and deal terms'],
            ['Wide Credit Coverage', 'Multiple EPR credit categories'],
            ['Expert Support', 'Platform support throughout the deal'],
          ].map(([title, description]) => (
            <div key={title} className="bg-white border border-[#E5EAF0] rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center">✓</div>
              <div><p className="font-semibold text-sm text-[#0F1923]" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p><p className="text-xs text-[#6B7280] mt-1">{description}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0F1923] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['Document Verification', 'Listings are reviewed before being published.'],
              ['Mediated Process', 'Buyer and seller communication stays inside the platform.'],
              ['Clear Deal States', 'Requests, quotations, payments and disputes are tracked.'],
              ['Confidentiality', 'Direct contact details are not exposed through listings.'],
            ].map(([title, description]) => (
              <div key={title} className="flex flex-col gap-2"><div className="w-8 h-8 rounded-lg bg-[#5AC361] bg-opacity-20 text-[#5AC361] flex items-center justify-center">✓</div><p className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p><p className="text-xs text-[#9CA3AF] leading-relaxed">{description}</p></div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="bg-gradient-to-br from-[#EBF8EC] to-[#F0F4F8] border border-[#A5D6A7] rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold text-[#0F1923] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Ready to trade EPR Credits?</h2>
            <p className="text-[#6B7280] mb-8 max-w-md mx-auto">Create an account to request credits, list inventory, and manage your EPR transactions.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate('auth-signup')}>Sign Up as Seller</Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate('auth-signup')}>Sign Up as Buyer</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export { HomePage as default }
