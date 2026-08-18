import { useEffect, useMemo, useState } from "react";

import { CREDIT_TYPES } from "../data/mock";

import { Badge, CreditTypeIcon } from "../components/ui";

import api from "../services/api.js";
const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Quantity: High to Low", value: "qty-desc" },
  { label: "Newest First", value: "newest" },
];
function MarketplacePage({ onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    type: "",
    location: "",
    year: "",
  });

  const [sort, setSort] = useState("price-asc");
  const [page, setPage] = useState(1);

  const PER_PAGE = 8;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/listings");

        if (response.data.success) {
          setListings(response.data.listings);
        }
      } catch (err) {
        console.error("Failed to load marketplace listings:", err);

        setError(
          err.response?.data?.message || "Failed to load marketplace listings.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const states = [
    "Delhi",
    "Gujarat",
    "Maharashtra",
    "Tamil Nadu",
    "Rajasthan",
    "Karnataka",
    "Haryana",
    "Uttar Pradesh",
    "Punjab",
  ];

  const marketplaceCreditTypes = useMemo(
    () =>
      Array.from(
        new Set([
          ...CREDIT_TYPES,
          ...listings
            .map((listing) => listing.category)
            .filter(Boolean),
        ])
      ),
    [listings]
  );
  const filtered = useMemo(() => {
    const result = listings.filter((listing) => {
      if (filters.type && listing.category !== filters.type) {
        return false;
      }

      if (filters.location && listing.location !== filters.location) {
        return false;
      }

      if (filters.year && listing.complianceYear !== filters.year) {
        return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }

      if (sort === "price-desc") {
        return b.price - a.price;
      }

      if (sort === "qty-desc") {
        return b.quantity - a.quantity;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [listings, filters, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-[#0F1923]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              EPR Credit Marketplace
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {filtered.length} verified listings available
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-6 bg-white border border-[#E5EAF0] rounded-xl p-4">
          <select
            className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]"
            value={filters.type}
            onChange={(e) => {
              setFilters((f) => ({ ...f, type: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All Credit Types</option>
            {marketplaceCreditTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[140px]"
            value={filters.location}
            onChange={(e) => {
              setFilters((f) => ({ ...f, location: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All Locations</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361] min-w-[130px]"
            value={filters.year}
            onChange={(e) => {
              setFilters((f) => ({ ...f, year: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All Years</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Sort:</span>
            <select
              className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5AC361]"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {(filters.type || filters.location || filters.year) && (
            <button
              className="text-sm text-[#EF4444] hover:underline"
              onClick={() => {
                setFilters({ type: "", location: "", year: "" });
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Credit type pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilters((f) => ({ ...f, type: "" }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${!filters.type ? "bg-[#5AC361] text-white border-[#5AC361]" : "border-[#E5EAF0] text-[#6B7280] hover:border-[#CBD5E1] bg-white"}`}
          >
            All
          </button>
          {marketplaceCreditTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilters((f) => ({ ...f, type: t }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${filters.type === t ? "bg-[#5AC361] text-white border-[#5AC361]" : "border-[#E5EAF0] text-[#6B7280] hover:border-[#CBD5E1] bg-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-20 text-center text-[#9CA3AF]">
            Loading marketplace listings...
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-[#EF4444] font-medium">{error}</p>
          </div>
        )}

        {/* Grid */}
        {/* Marketplace grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {paged.map((credit) => (
              <div
                key={credit._id}
                className="bg-white border border-[#E5EAF0] rounded-xl p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 cursor-pointer flex flex-col gap-3"
                onClick={() => onNavigate("credit-detail", credit._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center flex-shrink-0">
                      <CreditTypeIcon type={credit.category} />
                    </div>
                    <Badge
                      label={
                        credit.sellerId?.verifiedBadge
                          ? "Verified Seller"
                          : "Verified"
                      }
                    />
                  </div>
                  <span className="text-xs text-[#9CA3AF]">
                    {credit.sellerId?.company ||
                      credit.sellerId?.name ||
                      "Verified Seller"}
                  </span>
                </div>

                <div>
                  <h3
                    className="font-semibold text-[#0F1923] text-base"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {credit.category} EPR Credits
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className="text-xl font-bold text-[#5AC361]"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      ₹{credit.price}
                    </span>
                    <span className="text-xs text-[#6B7280]">/MT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="font-medium text-[#374151]">
                      {credit.quantity} MT
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span>{credit.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Valid{" "}
                      {credit.validTill
                        ? new Date(credit.validTill).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full mt-1 py-2 rounded-lg text-sm font-medium border border-[#5AC361] text-[#5AC361] hover:bg-[#EBF8EC] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("credit-detail", credit._id);
                  }}
                >
                  Request This Credit
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-[#9CA3AF]">
            <p className="text-lg font-semibold text-[#374151]">
              {listings.length === 0 ? "No active listings available" : "No credits match your filters"}
            </p>
            <p className="text-sm mt-1">
              {listings.length === 0 ? "Approved seller listings will appear here." : "Try adjusting or clearing your filters"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm text-[#374151] hover:bg-[#F0F4F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-[#5AC361] text-white" : "border border-[#E5EAF0] text-[#374151] hover:bg-[#F0F4F8]"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 border border-[#E5EAF0] rounded-lg text-sm text-[#374151] hover:bg-[#F0F4F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export { MarketplacePage as default };