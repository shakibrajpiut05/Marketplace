const badgeStyles = {
  verified: 'bg-[#EBF8EC] text-[#2E7D32] border-[#A5D6A7]',
  active: 'bg-[#EBF8EC] text-[#2E7D32] border-[#A5D6A7]',
  pending: 'bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]',
  rejected: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  discussion: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  open: 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]',
  closed: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
  new: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  matched: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  completed: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
  payment: 'bg-[#FFF7ED] text-[#92400E] border-[#FED7AA]',
}
const badgeLabels = {
  Active: 'active',
  Verified: 'verified',
  'Pending Verification': 'pending',
  Pending: 'pending',
  Rejected: 'rejected',
  'In Discussion': 'discussion',
  Open: 'open',
  Closed: 'closed',
  New: 'new',
  'In Review': 'pending',
  Negotiating: 'discussion',
  'Terms Agreed': 'matched',
  Matched: 'matched',
  Completed: 'completed',
  'Payment Coordination': 'payment',
}
function Badge({ label, variant }) {
  const v = variant ?? badgeLabels[label] ?? 'closed'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyles[v]}`}
    >
      {(v === 'verified' || v === 'active') && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <path
            d="M10 3L5 8.5 2 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </span>
  )
}
const btnBase =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AC361] disabled:opacity-50 disabled:cursor-not-allowed'
const btnVariants = {
  primary: 'bg-[#5AC361] hover:bg-[#3EA646] text-white rounded-lg',
  secondary: 'bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#374151] rounded-lg',
  outline:
    'border border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-[#F7F9FB] text-[#374151] rounded-lg bg-white',
  ghost: 'hover:bg-[#F0F4F8] text-[#374151] rounded-lg',
  danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg',
}
const btnSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}
function Button({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-[#E5EAF0] rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}
function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-3 py-2 border rounded-lg text-sm bg-white text-[#0F1923] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5AC361] focus:border-[#5AC361] transition-colors ${error ? 'border-[#EF4444]' : 'border-[#E5EAF0]'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#EF4444]">{error}</span>}
    </div>
  )
}
function Select({ label, options, placeholder, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white text-[#0F1923] focus:outline-none focus:ring-2 focus:ring-[#5AC361] focus:border-[#5AC361] transition-colors ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
function Textarea({ label, className = '', id, rows = 3, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white text-[#0F1923] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5AC361] focus:border-[#5AC361] transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  )
}
function StatCard({ label, value, icon, accent }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-[#EBF8EC] text-[#5AC361]' : 'bg-[#F0F4F8] text-[#6B7280]'}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">{label}</p>
        <p
          className="text-2xl font-bold text-[#0F1923]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}
function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5EAF0]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F8]">{children}</tbody>
      </table>
    </div>
  )
}
function Tr({ children, className = '' }) {
  return <tr className={`hover:bg-[#F7F9FB] transition-colors ${className}`}>{children}</tr>
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-[#374151] whitespace-nowrap ${className}`}>{children}</td>
}
function ConfidentialityBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-sm text-[#1D4ED8]">
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
      <span>Contact details are hidden. All communication is routed through EPR Nexus.</span>
    </div>
  )
}
function CreditTypeIcon({ type }) {
  const icons = {
    Battery: (
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
          d="M21 10h-1V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-3h1"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12h4" />
      </svg>
    ),
    Plastic: (
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
          d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    ),
    'E-Waste': (
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
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
        />
      </svg>
    ),
    ELV: (
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
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    'Used Oil': (
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
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    Tyre: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
    ),
  }
  return <>{icons[type] ?? icons['Battery']}</>
}
function EmptyState({ title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[#F0F4F8] flex items-center justify-center text-[#9CA3AF]">
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[#374151]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </p>
        <p className="text-sm text-[#6B7280] mt-1">{desc}</p>
      </div>
      {action}
    </div>
  )
}
export {
  Badge,
  Button,
  Card,
  ConfidentialityBanner,
  CreditTypeIcon,
  EmptyState,
  Input,
  Select,
  StatCard,
  Table,
  Td,
  Textarea,
  Tr,
}
