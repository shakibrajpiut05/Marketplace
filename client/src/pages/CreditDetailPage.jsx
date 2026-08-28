import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  ConfidentialityBanner,
  CreditTypeIcon,
  Input,
  Textarea,
} from "../components/ui";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

/*
|--------------------------------------------------------------------------
| Request Modal
|--------------------------------------------------------------------------
*/

function AuthenticationRequiredModal({ onClose, onLogin, onSignup }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5EAF0] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className="text-lg font-bold text-[#0F1923]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Authentication Required
            </h3>
            <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
              Please login or create an account to continue with this action.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F7F9FB]"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" onClick={onLogin}>
            Login
          </Button>
          <Button className="w-full" onClick={onSignup}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}

function RequestModal({ onClose, credit }) {
  const [form, setForm] = useState({
    qty: "",
    contact: "",
    notes: "",
    company: "",
    email: "",
    gst: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!form.qty) {
      alert("Please enter the required quantity.");
      return;
    }

    if (Number(form.qty) <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (Number(form.qty) > Number(credit.quantity)) {
      alert(`Only ${credit.quantity} MT is available for this listing.`);
      return;
    }

    if (!form.contact.trim()) {
      alert("Please enter the contact person.");
      return;
    }

    if (!form.company.trim()) {
      alert("Please enter your company name.");
      return;
    }

    if (!form.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!form.gst.trim()) {
      alert("Please enter your GST number.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/requests", {
        listingId: credit._id,
        quantity: Number(form.qty),
        contactPerson: form.contact.trim(),
        companyName: form.company.trim(),
        email: form.email.trim(),
        gstNumber: form.gst.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      });

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Purchase request error:", error);

      alert(
        error.response?.data?.message || "Failed to submit purchase request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
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
            style={{
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Request Sent!
          </h3>

          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            Your request has been sent to EPR Nexus. Our team will verify and
            connect you within <strong>24–48 hours</strong>.
          </p>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E5EAF0] flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-bold text-[#0F1923]"
              style={{
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Request This Credit
            </h3>

            <p className="text-sm text-[#6B7280]">
              {credit.category} EPR Credits
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#F0F4F8] rounded-lg text-[#6B7280] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <ConfidentialityBanner />

          <p className="text-xs text-[#6B7280] mt-3 italic">
            EPR Nexus will contact you once your interest is verified — seller
            contact details are never shared directly.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Required Quantity (MT) *"
              placeholder={`Max ${credit.quantity} MT`}
              type="number"
              min="1"
              max={credit.quantity}
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  qty: e.target.value,
                }))
              }
            />

            <Input
              label="Contact Person *"
              placeholder="Full name"
              value={form.contact}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contact: e.target.value,
                }))
              }
            />

            <Input
              label="Your Company Name *"
              placeholder="Company legal name"
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  company: e.target.value,
                }))
              }
            />

            <Input
              label="Email *"
              type="email"
              placeholder="work@company.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  email: e.target.value,
                }))
              }
            />

            <Input
              label="GST Number *"
              placeholder="22AAAAA0000A1Z5"
              value={form.gst}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  gst: e.target.value,
                }))
              }
            />

            <Input
              label="Phone Number *"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phone: e.target.value,
                }))
              }
            />

            <div className="sm:col-span-2">
              <Textarea
                label="Additional Notes"
                placeholder="Any specific requirements, compliance year preference, etc."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>

            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Credit Detail Page
|--------------------------------------------------------------------------
*/

function CreditDetailPage({ creditId, onNavigate }) {
  const { user } = useAuth();
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saved, setSaved] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch listing
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        if (!creditId) {
          setError("Listing ID is missing.");
          return;
        }

        const response = await api.get(`/listings/${creditId}`);

        if (response.data.success) {
          setCredit(response.data.listing);
        } else {
          setError(response.data.message || "Failed to load listing.");
        }
      } catch (err) {
        console.error("Failed to load credit details:", err);

        setError(
          err.response?.data?.message || "Failed to load credit details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [creditId]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E5EAF0] border-t-[#5AC361] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-[#6B7280]">Loading credit details...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !credit) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto mb-4">
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
                d="M12 9v4m0 4h.01M10.29 3.86l-7.42 13A2 2 0 004.6 20h14.8a2 2 0 001.73-3.14l-7.42-13a2 2 0 00-3.46 0z"
              />
            </svg>
          </div>

          <h2
            className="text-xl font-bold text-[#0F1923]"
            style={{
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Credit Not Available
          </h2>

          <p className="text-sm text-[#6B7280] mt-2 mb-5">
            {error || "This listing could not be found."}
          </p>

          <Button onClick={() => onNavigate("marketplace")}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const formattedValidTill = credit.validTill
    ? new Date(credit.validTill).toLocaleDateString("en-IN")
    : "—";

  const formattedListedOn = credit.createdAt
    ? new Date(credit.createdAt).toLocaleDateString("en-IN")
    : "—";

  const sellerName =
    credit.sellerId?.company || credit.sellerId?.name || "Verified Seller";

  const sellerDisplayId = credit.sellerId?._id || "—";

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {showAuthModal && (
        <AuthenticationRequiredModal
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            setShowAuthModal(false);
            onNavigate("auth");
          }}
          onSignup={() => {
            setShowAuthModal(false);
            onNavigate("auth-signup");
          }}
        />
      )}

      {showModal && (
        <RequestModal onClose={() => setShowModal(false)} credit={credit} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#374151] mb-6 transition-colors"
          onClick={() => onNavigate("marketplace")}
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Marketplace
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Main info */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Header card */}
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center">
                    <CreditTypeIcon type={credit.category} />
                  </div>

                  <div>
                    <h1
                      className="text-2xl font-bold text-[#0F1923]"
                      style={{
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      {credit.category} EPR Credits
                    </h1>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge label="Verified" />

                      {credit.sellerId?.verifiedBadge && (
                        <Badge label="Verified Seller" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail table */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  {
                    label: "Available Quantity",
                    value: `${credit.quantity} MT`,
                  },
                  {
                    label: "Asking Price",
                    value: (
                      <span className="text-[#5AC361] font-bold">
                        ₹{credit.price} / MT
                      </span>
                    ),
                  },
                  {
                    label: "Location",
                    value: credit.location || "—",
                  },
                  {
                    label: "Compliance Year",
                    value: credit.complianceYear || "—",
                  },
                  {
                    label: "Valid Till",
                    value: formattedValidTill,
                  },
                  {
                    label: "Seller",
                    value: sellerName,
                  },
                  {
                    label: "Seller ID",
                    value: (
                      <span className="font-mono text-xs bg-[#F0F4F8] px-2 py-1 rounded">
                        {sellerDisplayId}
                      </span>
                    ),
                  },
                  {
                    label: "Listed On",
                    value: formattedListedOn,
                  },
                  {
                    label: "Status",
                    value: <Badge label="Active" />,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 p-3 bg-[#F7F9FB] rounded-lg"
                  >
                    <span className="text-xs text-[#6B7280] font-medium">
                      {row.label}
                    </span>

                    <span className="text-sm font-medium text-[#0F1923]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-6">
              <h2
                className="text-base font-semibold text-[#0F1923] mb-3"
                style={{
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                About This Credit
              </h2>

              <p className="text-sm text-[#6B7280] leading-relaxed">
                {credit.description || "No description provided."}
              </p>
            </div>

            <ConfidentialityBanner />
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#E5EAF0] rounded-xl p-5 sticky top-20">
              <div className="text-center mb-5">
                <p
                  className="text-3xl font-bold text-[#5AC361]"
                  style={{
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  ₹{credit.price}
                </p>

                <p className="text-sm text-[#6B7280]">
                  per MT · {credit.quantity} MT available
                </p>

                <p className="text-xs text-[#9CA3AF] mt-1">
                  Total est. ₹
                  {(
                    Number(credit.price) * Number(credit.quantity)
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              {user?.role === "seller" ? (
                <button
                  type="button"
                  disabled
                  className="w-full mb-3 py-3 rounded-lg text-sm font-semibold border border-[#E5EAF0] bg-[#F8FAFC] text-[#9CA3AF] cursor-not-allowed"
                  title="Seller accounts are not authorized to request credits."
                >
                  Sellers cannot request credits
                </button>
              ) : user?.role === "buyer" && user?.kycStatus !== "approved" ? (
                <button
                  type="button"
                  disabled
                  className="w-full mb-3 py-3 rounded-lg text-sm font-semibold border border-[#FCD34D] bg-[#FFFBEB] text-[#92400E] cursor-not-allowed"
                  title="Complete business verification before requesting credits."
                >
                  Verification required to request
                </button>
              ) : (
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                      return;
                    }
                    setShowModal(true);
                  }}
                >
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
                      d="M15 15l-2 5L9 9l11 4-5-2zm0 0l5 5"
                    />
                  </svg>
                  Request This Credit
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (!user) {
                    setShowAuthModal(true);
                    return;
                  }
                  setSaved((s) => !s);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill={saved ? "currentColor" : "none"}
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

                {saved ? "Saved" : "Save for Later"}
              </Button>

              <div className="mt-4 pt-4 border-t border-[#E5EAF0] text-xs text-[#6B7280] text-center leading-relaxed">
                EPR Nexus will contact you once your interest is verified.
                Seller contact details are never shared directly.
              </div>
            </div>

            {/* Similar Credits */}
            <SimilarCredits currentListing={credit} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Similar Credits
|--------------------------------------------------------------------------
|
| Uses the public marketplace endpoint and filters locally.
|
*/

function SimilarCredits({ currentListing, onNavigate }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const response = await api.get(
          `/listings?category=${encodeURIComponent(currentListing.category)}`,
        );

        if (response.data.success) {
          setListings(response.data.listings);
        }
      } catch (error) {
        console.error("Failed to load similar credits:", error);
      }
    };

    fetchSimilar();
  }, [currentListing.category]);

  const similar = listings
    .filter((listing) => listing._id !== currentListing._id)
    .slice(0, 2);

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl p-5">
      <h3
        className="text-sm font-semibold text-[#374151] mb-3"
        style={{
          fontFamily: "Outfit, sans-serif",
        }}
      >
        Similar Credits
      </h3>

      {similar.length > 0 ? (
        similar.map((listing) => (
          <button
            key={listing._id}
            type="button"
            onClick={() => onNavigate("credit-detail", listing._id)}
            className="w-full text-left p-3 rounded-lg hover:bg-[#F7F9FB] transition-colors border border-[#E5EAF0] mb-2 flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-medium text-[#374151]">
                {listing.category} • {listing.quantity} MT
              </p>

              <p className="text-xs text-[#6B7280]">
                {listing.location} · FY {listing.complianceYear}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-[#5AC361]">
                ₹{listing.price}
              </p>

              <p className="text-xs text-[#9CA3AF]">/MT</p>
            </div>
          </button>
        ))
      ) : (
        <p className="text-xs text-[#9CA3AF] text-center py-2">
          No other {currentListing.category} credits listed
        </p>
      )}
    </div>
  );
}

export { CreditDetailPage as default };