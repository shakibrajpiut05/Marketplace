import { useEffect, useMemo, useState } from "react";
import { CREDIT_TYPES } from "../data/mock";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { NotificationBell, ProfileMenu } from "../components/AccountTools.jsx";
import {
  Badge,
  DashboardShell,
  Button,
  Card,
  StatCard,
  Table,
  Tr,
  Td,
  Input,
  Select,
  Textarea,
} from "../components/ui";
import { MessageChat } from "../components/MessageCenter.jsx";
import { QuotationCard } from "../components/QuotationCenter.jsx";
import { DealRoom } from "../components/DealRoom.jsx";
import { DisputesPage } from "../components/DisputeCenter.jsx";
const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
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
    id: "requirements",
    label: "My Requirements",
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
    id: "matching",
    label: "Matching Opportunities",
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
          d="M13 3l-1 7h7l-9 11 1-8H4l9-10z"
        />
      </svg>
    ),
  },
  {
    id: "requests",
    label: "My Requests",
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
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
        />
      </svg>
    ),
  },
  {
    id: "quotations",
    label: "Quotations",
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
          d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h4m-6 4h8m-8 4h5"
        />
      </svg>
    ),
  },
  {
    id: "deals",
    label: "Deals",
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
    id: "watchlist",
    label: "Watchlist",
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
          d="M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.5L6 21V4.75z"
        />
      </svg>
    ),
  },
  {
    id: "disputes",
    label: "Disputes",
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
          d="M12 9v3m0 4h.01M10.29 3.86l-7.2 12.48A2 2 0 004.82 19h14.36a2 2 0 001.73-2.66l-7.2-12.48a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
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
    id: "profile",
    label: "Profile",
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
];
function PostRequirementModal({ onClose, onCreated }) {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    type: "",
    qty: "",
    budget: "",
    location: "",
    year: "2025-26",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const states = [
    "Any Location",
    "Delhi",
    "Gujarat",
    "Maharashtra",
    "Tamil Nadu",
    "Rajasthan",
    "Karnataka",
  ];
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
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Requirement Posted!
          </h3>
          <p className="text-sm text-[#6B7280] mb-5">
            EPR Nexus will match you with suitable verified sellers and reach
            out within 24–48 hours.
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
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between">
          <h3
            className="text-lg font-bold text-[#0F1923]"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Post a Requirement
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F0F4F8] rounded-lg text-[#6B7280]"
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
              onChange={(e) =>
                setForm((f) => ({ ...f, budget: e.target.value }))
              }
            />
          </div>
          <Select
            label="Location Preference"
            options={states.map((s) => ({ label: s, value: s }))}
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
          <Select
            label="Compliance Year *"
            options={[
              { label: "FY 2025-26", value: "2025-26" },
              { label: "FY 2024-25", value: "2024-25" },
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
                  setError("Please select a credit type.");
                  return;
                }

                if (!form.qty || Number(form.qty) <= 0) {
                  setError("Please enter a valid required quantity.");
                  return;
                }

                if (!form.budget || Number(form.budget) <= 0) {
                  setError("Please enter a valid budget.");
                  return;
                }

                if (!form.year) {
                  setError("Please select a compliance year.");
                  return;
                }

                try {
                  setSubmitting(true);
                  setError("");

                  const response = await api.post("/requirements", {
                    type: form.type,
                    quantity: Number(form.qty),
                    budget: Number(form.budget),
                    location:
                      form.location === "Any Location" ? "" : form.location,
                    complianceYear: form.year,
                    notes: form.notes.trim(),
                  });

                  if (response.data.success) {
                    onCreated?.(response.data.requirement);
                    setDone(true);
                    setForm({
                      type: "",
                      qty: "",
                      budget: "",
                      location: "",
                      year: "2025-26",
                      notes: "",
                    });
                  }
                } catch (error) {
                  console.error("Post requirement error:", error);
                  setError(
                    error.response?.data?.message ||
                      "Failed to post requirement.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Posting..." : "Post Requirement"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function BuyerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [showPostModal, setShowPostModal] = useState(false);

  const [buyerRequirements, setBuyerRequirements] = useState([]);
  const [requirementLoading, setRequirementLoading] = useState(true);
  const [requirementError, setRequirementError] = useState("");

  const [buyerRequests, setBuyerRequests] = useState([]);
  const [buyerDeals, setBuyerDeals] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [dealLoading, setDealLoading] = useState(true);
  const [dealError, setDealError] = useState("");
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [messageUnreadByRequest, setMessageUnreadByRequest] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [requirementMatches, setRequirementMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");
  const [matchAlerts, setMatchAlerts] = useState([]);
  const [matchAlertsLoading, setMatchAlertsLoading] = useState(false);
  const [matchAlertsError, setMatchAlertsError] = useState("");

  const buyerCompany = user?.company?.trim() || user?.name?.trim() || "Buyer";
  const buyerName = user?.name?.trim() || "Buyer";
  const buyerInitial = buyerCompany.slice(0, 1).toUpperCase();

  const fetchMessageUnread = async () => {
    try {
      const response = await api.get("/deal-messages/unread-count");
      if (response.data.success) {
        setMessageUnreadCount(Number(response.data.unreadCount || 0));
        setMessageUnreadByRequest(response.data.byRequest || {});
      }
    } catch (error) {
      console.error("Failed to fetch message unread count:", error);
    }
  };

  const markRequestMessagesRead = async (requestId) => {
    setMessageUnreadByRequest((current) => {
      const next = { ...current };
      delete next[String(requestId)];
      return next;
    });
    setMessageUnreadCount((count) =>
      Math.max(
        0,
        count - Number(messageUnreadByRequest[String(requestId)] || 0),
      ),
    );
  };

  const fetchWatchlist = async () => {
    try {
      setWatchlistLoading(true);
      setWatchlistError("");

      const response = await api.get("/watchlist");

      if (response.data.success) {
        setWatchlist(response.data.listings || []);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      setWatchlistError(
        error.response?.data?.message || "Failed to load your watchlist.",
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  const removeFromWatchlist = async (listingId) => {
    try {
      await api.delete(`/watchlist/${listingId}`);
      setWatchlist((current) =>
        current.filter((listing) => String(listing._id) !== String(listingId)),
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to remove listing from watchlist.",
      );
    }
  };

  const openRequirementMatches = async (requirement) => {
    setSelectedRequirement(requirement);
    setMatchesOpen(true);
    setMatchesLoading(true);
    setMatchesError("");
    setRequirementMatches([]);

    try {
      const response = await api.get(
        `/matching/requirements/${requirement._id}/matches`,
      );
      if (response.data.success) {
        setRequirementMatches(response.data.matches || []);
      } else {
        setMatchesError(response.data.message || "Failed to load matches.");
      }
    } catch (error) {
      console.error("Failed to load requirement matches:", error);
      setMatchesError(
        error.response?.data?.message ||
          "Failed to load matching opportunities.",
      );
    } finally {
      setMatchesLoading(false);
    }
  };

  const closeRequirementMatches = () => {
    setMatchesOpen(false);
    setSelectedRequirement(null);
    setRequirementMatches([]);
    setMatchesError("");
  };

  const fetchMatchAlerts = async () => {
    try {
      setMatchAlertsLoading(true);
      setMatchAlertsError("");
      const response = await api.get("/notifications", {
        params: { limit: 25 },
      });
      if (response.data.success) {
        setMatchAlerts(
          (response.data.notifications || []).filter(
            (notification) =>
              notification.type === "requirement_match_found" ||
              notification.type === "requirement_matched",
          ),
        );
      }
    } catch (error) {
      console.error("Failed to fetch matching alerts:", error);
      setMatchAlertsError(
        error.response?.data?.message || "Failed to load matching alerts.",
      );
    } finally {
      setMatchAlertsLoading(false);
    }
  };

  const markMatchAlertRead = async (notification) => {
    if (notification?.read) return;
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      setMatchAlerts((current) =>
        current.map((item) =>
          String(item._id) === String(notification._id)
            ? { ...item, read: true }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark matching alert read:", error);
    }
  };

  const findRequirementById = (requirementId) =>
    buyerRequirements.find(
      (requirement) => String(requirement._id) === String(requirementId),
    );

  const fetchBuyerData = async () => {
    try {
      setRequirementLoading(true);
      setRequestLoading(true);
      setDealLoading(true);

      setRequirementError("");
      setRequestError("");
      setDealError("");

      const [requirementsResponse, requestsResponse, dealsResponse] =
        await Promise.all([
          api.get("/requirements/buyer"),
          api.get("/requests/buyer"),
          api.get("/deals/buyer"),
        ]);

      if (requirementsResponse.data.success) {
        setBuyerRequirements(requirementsResponse.data.requirements || []);
      }

      if (requestsResponse.data.success) {
        setBuyerRequests(requestsResponse.data.requests || []);
      }

      if (dealsResponse.data.success) {
        setBuyerDeals(dealsResponse.data.deals || []);
      }
    } catch (error) {
      console.error("Failed to fetch buyer dashboard data:", error);

      const message =
        error.response?.data?.message || "Failed to load buyer data.";

      setRequirementError(message);
      setRequestError(message);
      setDealError(message);
    } finally {
      setRequirementLoading(false);
      setRequestLoading(false);
      setDealLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
    fetchWatchlist();
    fetchMatchAlerts();
    fetchMessageUnread();
    const interval = window.setInterval(fetchMessageUnread, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const openReqs = useMemo(
    () =>
      buyerRequirements.filter((requirement) =>
        ["open", "matching", "matched"].includes(requirement.status),
      ).length,
    [buyerRequirements],
  );

  const requestsSent = buyerRequests.length;
  const dealsInProgress = buyerDeals.filter(
    (deal) => !["completed", "cancelled"].includes(deal.status),
  ).length;
  const completedDeals = buyerDeals.filter(
    (deal) => deal.status === "completed",
  ).length;
  return (
    <>
      {matchesOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0F1923]/45 p-4 backdrop-blur-[1px]">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5EAF0] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                  Matching opportunities
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold text-[#101828]">
                  {selectedRequirement?.type || "EPR Credit"} requirement
                </h3>
                <p className="mt-1 text-sm text-[#667085]">
                  {Number(
                    selectedRequirement?.remainingQuantity ||
                      selectedRequirement?.quantity ||
                      0,
                  ).toLocaleString("en-IN")}{" "}
                  MT remaining · Budget ₹
                  {Number(selectedRequirement?.budget || 0).toLocaleString(
                    "en-IN",
                  )}
                  /MT
                </p>
              </div>
              <button
                type="button"
                onClick={closeRequirementMatches}
                className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7]"
                aria-label="Close matches"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-5">
              {matchesLoading ? (
                <div className="py-16 text-center text-sm text-[#667085]">
                  Finding suitable active listings…
                </div>
              ) : matchesError ? (
                <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-sm text-[#991B1B]">
                  {matchesError}
                </div>
              ) : requirementMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#DCE3EA] bg-[#F8FAFC] px-5 py-12 text-center">
                  <p className="font-semibold text-[#344054]">
                    No suitable active listings yet
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    We'll notify you when a verified listing meets your
                    requirement.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirementMatches.map((match) => (
                    <div
                      key={String(match.listingId)}
                      className="rounded-xl border border-[#E5EAF0] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading font-semibold text-[#101828]">
                              {match.category}
                            </h4>
                            <Badge
                              label={`${match.matchScore}% Match`}
                              variant="matched"
                            />
                            {match.seller?.verifiedBadge && (
                              <Badge
                                label="Verified Seller"
                                variant="verified"
                              />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[#667085]">
                            {match.seller?.company || "Verified Seller"} ·{" "}
                            {match.location || "Location not specified"}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-heading text-lg font-bold text-[#101828]">
                            ₹{Number(match.price || 0).toLocaleString("en-IN")}
                            /MT
                          </p>
                          <p className="text-xs text-[#667085]">
                            {Number(
                              match.availableQuantity || 0,
                            ).toLocaleString("en-IN")}{" "}
                            MT available
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-[#F8FAFC] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                            Year
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#344054]">
                            FY {match.complianceYear}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#F8FAFC] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                            Coverage
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#344054]">
                            {Number(match.quantityCoverage || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            MT
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#F8FAFC] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                            Valid till
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#344054]">
                            {match.validTill
                              ? new Date(match.validTill).toLocaleDateString(
                                  "en-IN",
                                )
                              : "—"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#F8FAFC] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                            Budget
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#2E7D32]">
                            Within budget
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(match.reasons || []).slice(0, 4).map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-[#F0FBF1] px-2.5 py-1 text-[11px] font-medium text-[#2E7D32]"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            closeRequirementMatches();
                            onNavigate("credit-detail", match.listingId);
                          }}
                        >
                          View credit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPostModal && (
        <PostRequirementModal
          onClose={() => setShowPostModal(false)}
          onCreated={(createdRequirement) => {
            setBuyerRequirements((current) => [createdRequirement, ...current]);
          }}
        />
      )}

      <DashboardShell
        nav={NAV}
        active={active}
        onActiveChange={setActive}
        onNavigate={onNavigate}
        roleLabel="Buyer Portal"
        displayName={buyerCompany}
        secondaryText={`${buyerName} · Buyer account`}
        initial={buyerInitial}
        badges={{
          quotations: buyerRequests.filter(
            (request) =>
              request.offer?.finalAmount != null && !request.offer?.acceptedAt,
          ).length,
          messages: messageUnreadCount,
          watchlist: watchlist.length,
          matching: matchAlerts.filter((alert) => !alert.read).length,
        }}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("home")}
            >
              Home
            </Button>
            <NotificationBell compact onNavigate={onNavigate} />
            <ProfileMenu compact onNavigate={onNavigate} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("marketplace")}
              className="hidden sm:inline-flex"
            >
              Browse Credits
            </Button>
            <Button size="sm" onClick={() => setShowPostModal(true)}>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Post Requirement</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </>
        }
        titleFallback="Buyer Dashboard"
        variant="light"
      >
        {active === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#5AC361] mb-1">
                  Buyer workspace
                </p>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#0F1923] tracking-tight"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Welcome back, {buyerName.split(" ")[0]}
                </h2>
                <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">
                  Find the right EPR credits, manage your requirements, and keep
                  active transactions moving.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate("marketplace")}
                >
                  Browse Credits
                </Button>
                <Button size="sm" onClick={() => setShowPostModal(true)}>
                  + Post Requirement
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
                label="Pending Requests"
                value={
                  buyerRequests.filter(
                    (r) => !["completed", "cancelled"].includes(r.status),
                  ).length
                }
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
                label="Active Deals"
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

            {(() => {
              const quotationCount = buyerRequests.filter(
                (request) =>
                  request.offer?.finalAmount != null &&
                  !request.offer?.acceptedAt,
              ).length;
              const paymentPendingCount = buyerDeals.filter(
                (deal) =>
                  !["received", "paid", "completed"].includes(
                    String(deal.paymentStatus || "").toLowerCase(),
                  ) && !["completed", "cancelled"].includes(deal.status),
              ).length;
              const attentionCount =
                quotationCount + paymentPendingCount + messageUnreadCount;

              return (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        <h2
                          className="font-semibold text-[#0F1923]"
                          style={{ fontFamily: "Outfit, sans-serif" }}
                        >
                          Action Required
                        </h2>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        Items that may need your attention before a transaction
                        can move forward.
                      </p>
                    </div>
                    {attentionCount > 0 && (
                      <Badge
                        label={`${attentionCount} item${attentionCount === 1 ? "" : "s"}`}
                      />
                    )}
                  </div>

                  {attentionCount === 0 ? (
                    <div className="px-5 py-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EBF8EC] text-[#2E7D32] flex items-center justify-center shrink-0">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#374151]">
                          You’re all caught up
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          No quotations, payments, or unread messages require
                          action right now.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5EAF0]">
                      {quotationCount > 0 && (
                        <button
                          onClick={() => setActive("quotations")}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h4m-6 4h8m-8 4h5"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#374151]">
                                Quotation{quotationCount > 1 ? "s" : ""}{" "}
                                awaiting your response
                              </p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">
                                Review the latest commercial offer before it
                                expires.
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#2E7D32] shrink-0">
                            {quotationCount} →
                          </span>
                        </button>
                      )}
                      {paymentPendingCount > 0 && (
                        <button
                          onClick={() => setActive("deals")}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8c-2.21 0-4 1.12-4 2.5S9.79 13 12 13s4 1.12 4 2.5S14.21 18 12 18m0-10V6m0 12v-2m7-4a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#374151]">
                                Payment or deal coordination pending
                              </p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">
                                Open your active deal to see the next required
                                step.
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#2E7D32] shrink-0">
                            {paymentPendingCount} →
                          </span>
                        </button>
                      )}
                      {messageUnreadCount > 0 && (
                        <button
                          onClick={() => setActive("messages")}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#374151]">
                                Unread deal messages
                              </p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">
                                Check messages from EPR Nexus or transaction
                                participants.
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#2E7D32] shrink-0">
                            {messageUnreadCount} →
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between gap-3">
                  <div>
                    <h2
                      className="font-semibold text-[#0F1923]"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      Active Requirements
                    </h2>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Your latest demand for EPR credits.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActive("requirements")}
                  >
                    View All
                  </Button>
                </div>
                {requirementLoading ? (
                  <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
                    Loading requirements...
                  </div>
                ) : requirementError ? (
                  <div className="px-5 py-10 text-center text-sm text-[#EF4444]">
                    {requirementError}
                  </div>
                ) : buyerRequirements.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm font-semibold text-[#374151]">
                      No requirements yet
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Post what you need and EPR Nexus can match it with
                      suitable sellers.
                    </p>
                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowPostModal(true)}
                    >
                      Post Requirement
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5EAF0]">
                    {buyerRequirements.slice(0, 4).map((requirement) => (
                      <button
                        key={requirement._id}
                        onClick={() => setActive("requirements")}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[#374151]">
                              {requirement.type || "EPR Credit"}
                            </p>
                            <Badge label={requirement.status} />
                          </div>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {Number(requirement.quantity || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            MT · Budget ₹
                            {Number(requirement.budget || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            / MT
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#2E7D32] shrink-0">
                          View →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between gap-3">
                  <div>
                    <h2
                      className="font-semibold text-[#0F1923]"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      Recent Deals
                    </h2>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Keep track of your latest transactions.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActive("deals")}
                  >
                    View All
                  </Button>
                </div>
                {dealLoading ? (
                  <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
                    Loading deals...
                  </div>
                ) : dealError ? (
                  <div className="px-5 py-10 text-center text-sm text-[#EF4444]">
                    {dealError}
                  </div>
                ) : buyerDeals.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm font-semibold text-[#374151]">
                      No deals yet
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Accepted quotations will appear here as deals.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5EAF0]">
                    {buyerDeals.slice(0, 4).map((deal) => (
                      <button
                        key={deal._id}
                        onClick={() => setActive("deals")}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[#374151]">
                              {deal.listing?.category || "EPR Credit"}
                            </p>
                            <Badge label={deal.status} />
                          </div>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {Number(deal.quantity || 0).toLocaleString("en-IN")}{" "}
                            MT · ₹
                            {Number(
                              deal.finalAmount ?? deal.creditSubtotal ?? 0,
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#2E7D32] shrink-0">
                          View →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="flex items-start gap-3 px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm text-[#1D4ED8]">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
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
              <span>
                Contact details are hidden. All communication is routed through
                EPR Nexus. You are identified as{" "}
                <strong className="mx-1">{buyerCompany}</strong> on the
                marketplace.
              </span>
            </div>
          </div>
        )}
        {active === "requirements" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
              <div>
                <h2
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  All My Requirements
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Requirements you have posted for EPR credits.
                </p>
              </div>

              <Button size="sm" onClick={() => setShowPostModal(true)}>
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
                  Post a requirement and EPR Nexus will help match it with
                  verified sellers.
                </p>
              </div>
            ) : (
              <Table
                headers={[
                  "Credit Type",
                  "Required Qty",
                  "Budget (₹/MT)",
                  "Location Pref.",
                  "Year",
                  "Notes",
                  "Status",
                  "Posted On",
                ]}
              >
                {buyerRequirements.map((requirement) => (
                  <Tr key={requirement._id}>
                    <Td>
                      <span className="font-medium">{requirement.type}</span>
                    </Td>
                    <Td>
                      {Number(requirement.quantity || 0).toLocaleString(
                        "en-IN",
                      )}{" "}
                      MT
                    </Td>
                    <Td>
                      ₹{Number(requirement.budget || 0).toLocaleString("en-IN")}
                    </Td>
                    <Td>{requirement.location || "Any Location"}</Td>
                    <Td>{requirement.complianceYear || "—"}</Td>
                    <Td className="max-w-[220px]">
                      <span className="truncate block text-[#6B7280] text-xs">
                        {requirement.notes || "—"}
                      </span>
                    </Td>
                    <Td>
                      <Badge label={requirement.status} />
                    </Td>
                    <Td>
                      {requirement.createdAt
                        ? new Date(requirement.createdAt).toLocaleDateString(
                            "en-IN",
                          )
                        : "—"}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Card>
        )}

        {active === "matching" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#5AC361]">
                  Smart matching
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#0F1923]">
                  Matching Opportunities
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                  EPR Nexus compares your active requirements with verified
                  seller listings and surfaces opportunities that fit your
                  budget, location, quantity, and compliance year.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={fetchMatchAlerts}>
                Refresh alerts
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="overflow-hidden">
                <div className="border-b border-[#E5EAF0] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-[#101828]">
                        Your active requirements
                      </h3>
                      <p className="mt-1 text-xs text-[#98A2B3]">
                        Find live listings that match each requirement.
                      </p>
                    </div>
                    <Badge
                      label={`${buyerRequirements.filter((r) => ["open", "matching", "partially_matched", "matched"].includes(r.status)).length} Active`}
                    />
                  </div>
                </div>
                {requirementLoading ? (
                  <div className="px-5 py-14 text-center text-sm text-[#98A2B3]">
                    Loading requirements…
                  </div>
                ) : requirementError ? (
                  <div className="px-5 py-14 text-center text-sm text-[#D92D20]">
                    {requirementError}
                  </div>
                ) : buyerRequirements.filter((r) =>
                    [
                      "open",
                      "matching",
                      "partially_matched",
                      "matched",
                    ].includes(r.status),
                  ).length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <p className="font-heading text-sm font-semibold text-[#344054]">
                      No active requirements
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Post a requirement to start receiving matched
                      opportunities.
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => setShowPostModal(true)}
                    >
                      Post Requirement
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5EAF0]">
                    {buyerRequirements
                      .filter((r) =>
                        [
                          "open",
                          "matching",
                          "partially_matched",
                          "matched",
                        ].includes(r.status),
                      )
                      .map((requirement) => (
                        <div key={requirement._id} className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-heading font-semibold text-[#101828]">
                                  {requirement.type || "EPR Credit"}
                                </h4>
                                <Badge label={requirement.status} />
                              </div>
                              <p className="mt-1 text-sm text-[#667085]">
                                {Number(
                                  requirement.remainingQuantity ||
                                    requirement.quantity ||
                                    0,
                                ).toLocaleString("en-IN")}{" "}
                                MT remaining · Budget ₹
                                {Number(requirement.budget || 0).toLocaleString(
                                  "en-IN",
                                )}
                                /MT · {requirement.location || "Any location"}
                              </p>
                              <p className="mt-1 text-xs text-[#98A2B3]">
                                Compliance year: FY{" "}
                                {requirement.complianceYear || "—"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                openRequirementMatches(requirement)
                              }
                            >
                              Find matches
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-[#E5EAF0] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-[#101828]">
                        Matching Alerts
                      </h3>
                      <p className="mt-1 text-xs text-[#98A2B3]">
                        New listings that matched your requirements
                        automatically.
                      </p>
                    </div>
                    {matchAlerts.some((alert) => !alert.read) && (
                      <span className="rounded-full bg-[#EF4444] px-2 py-0.5 text-[10px] font-bold text-white">
                        {matchAlerts.filter((alert) => !alert.read).length} New
                      </span>
                    )}
                  </div>
                </div>
                {matchAlertsLoading ? (
                  <div className="px-5 py-14 text-center text-sm text-[#98A2B3]">
                    Loading alerts…
                  </div>
                ) : matchAlertsError ? (
                  <div className="px-5 py-14 text-center text-sm text-[#D92D20]">
                    {matchAlertsError}
                  </div>
                ) : matchAlerts.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FBF1] text-[#3EA646]">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.7}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 3l-1 7h7l-9 11 1-8H4l9-10z"
                        />
                      </svg>
                    </div>
                    <p className="mt-3 font-heading text-sm font-semibold text-[#344054]">
                      No matching alerts yet
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      We'll notify you here when a new active listing matches an
                      open requirement.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5EAF0]">
                    {matchAlerts.map((alert) => {
                      const requirement = findRequirementById(
                        alert.metadata?.requirementId || alert.entityId,
                      );
                      const listingId = alert.metadata?.listingId;
                      return (
                        <div
                          key={alert._id}
                          className={`p-4 ${alert.read ? "bg-white" : "bg-[#F7FCF8]"}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF8EC] text-[#3EA646]">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.7}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13 3l-1 7h7l-9 11 1-8H4l9-10z"
                                />
                              </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[#101828]">
                                    {alert.title}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                                    {alert.message}
                                  </p>
                                </div>
                                {!alert.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" />
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] text-[#98A2B3]">
                                  {alert.createdAt
                                    ? new Date(alert.createdAt).toLocaleString(
                                        "en-IN",
                                      )
                                    : ""}
                                </span>
                                {requirement && (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() =>
                                      openRequirementMatches(requirement)
                                    }
                                  >
                                    View matches
                                  </Button>
                                )}
                                {listingId && (
                                  <Button
                                    size="xs"
                                    onClick={() =>
                                      onNavigate("credit-detail", listingId)
                                    }
                                  >
                                    View credit
                                  </Button>
                                )}
                                {!alert.read && (
                                  <button
                                    type="button"
                                    onClick={() => markMatchAlertRead(alert)}
                                    className="text-[11px] font-semibold text-[#2E7D32] hover:underline"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {active === "requests" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
              <div>
                <h2
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
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
                            style={{ fontFamily: "Outfit, sans-serif" }}
                          >
                            {request.listing?.category || "EPR Credit"}
                          </h3>
                          <Badge label={request.status} />
                        </div>

                        <div className="mb-4">
                          <MessageChat
                            requestId={request._id}
                            role="buyer"
                            compact
                            onRead={markRequestMessagesRead}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">
                              Requested Quantity
                            </p>
                            <p className="font-medium text-[#374151]">
                              {request.requestedQuantity ?? 0} MT
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF]">
                              Listing Price
                            </p>
                            <p className="font-medium text-[#374151]">
                              ₹{request.listing?.price ?? "—"} / MT
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF]">
                              Compliance Year
                            </p>
                            <p className="font-medium text-[#374151]">
                              FY {request.listing?.complianceYear || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Location</p>
                            <p className="font-medium text-[#374151]">
                              {request.listing?.location || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Submitted</p>
                            <p className="font-medium text-[#374151]">
                              {request.createdAt
                                ? new Date(
                                    request.createdAt,
                                  ).toLocaleDateString("en-IN")
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Valid Till</p>
                            <p className="font-medium text-[#374151]">
                              {request.listing?.validTill
                                ? new Date(
                                    request.listing.validTill,
                                  ).toLocaleDateString("en-IN")
                                : "—"}
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

        {active === "quotations" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0]">
              <h2 className="font-semibold text-[#0F1923]">Quotations</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Review commercial offers issued by EPR Nexus. Accepting a
                quotation creates a deal with payment still pending.
              </p>
            </div>
            <div className="divide-y divide-[#E5EAF0]">
              {buyerRequests.filter(
                (request) => request.offer?.finalAmount != null,
              ).length === 0 ? (
                <div className="py-16 text-center text-sm text-[#9CA3AF]">
                  No quotations yet.
                </div>
              ) : (
                buyerRequests
                  .filter((request) => request.offer?.finalAmount != null)
                  .map((request) => (
                    <div
                      key={request._id}
                      className="p-5 grid lg:grid-cols-[1fr_380px] gap-5 items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#0F1923]">
                            {request.listing?.category || "EPR Credit"}
                          </h3>
                          <Badge
                            label={
                              request.offer?.acceptedAt
                                ? "Accepted"
                                : "Action required"
                            }
                          />
                        </div>
                        <p className="text-sm text-[#6B7280]">
                          {request.requestedQuantity || 0} MT · Request #
                          {request._id.slice(-6)}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-2">
                          Quotation #{request.offer.version} · Issued{" "}
                          {request.offer.sentAt
                            ? new Date(request.offer.sentAt).toLocaleString(
                                "en-IN",
                              )
                            : "—"}
                        </p>
                        {!request.offer?.acceptedAt ? (
                          <p className="text-xs text-[#52606D] mt-3">
                            Need a change? Open Messages and ask EPR Nexus. The
                            quotation itself can only be changed by EPR Nexus.
                          </p>
                        ) : (
                          <p className="text-xs text-[#2E7D32] mt-3">
                            Accepted does not mean payment received. Track
                            payment in My Deals.
                          </p>
                        )}
                      </div>
                      <div>
                        <QuotationCard
                          request={request}
                          onAccept={async () => {
                            try {
                              const response = await api.post(
                                `/requests/${request._id}/offer/accept`,
                              );
                              if (response.data.success) await fetchBuyerData();
                            } catch (error) {
                              alert(
                                error.response?.data?.message ||
                                  "Unable to accept this quotation.",
                              );
                            }
                          }}
                          accepting={false}
                        />
                        <div className="mt-2">
                          <MessageChat
                            requestId={request._id}
                            role="buyer"
                            compact
                            onRead={markRequestMessagesRead}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        )}

        {active === "deals" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
              <div>
                <h2
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
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
                    { key: "matched", label: "Matched" },
                    { key: "terms_agreed", label: "Quotation Accepted" },
                    {
                      key: "payment_coordination",
                      label: "Payment Coordination",
                    },
                    { key: "completed", label: "Completed" },
                  ];
                  const order = stages.map((stage) => stage.key);
                  const currentIndex = order.indexOf(deal.status);
                  const totalValue =
                    Number(deal.quantity || 0) * Number(deal.agreedPrice || 0);

                  return (
                    <div key={deal._id} className="p-5">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-4">
                            <h3
                              className="font-semibold text-[#0F1923]"
                              style={{ fontFamily: "Outfit, sans-serif" }}
                            >
                              {deal.listing?.category || "EPR Credit Deal"}
                            </h3>
                            <Badge label={deal.status.replaceAll("_", " ")} />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Quantity</p>
                              <p className="font-medium text-[#374151]">
                                {deal.quantity} MT
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Agreed Price
                              </p>
                              <p className="font-medium text-[#374151]">
                                ₹{deal.agreedPrice} / MT
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Credit Value
                              </p>
                              <p className="font-semibold text-[#5AC361]">
                                ₹
                                {Number(
                                  deal.creditSubtotal ?? totalValue,
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                EPR Nexus Fee
                              </p>
                              <p className="font-medium text-[#374151]">
                                ₹
                                {Number(
                                  deal.serviceFee ?? deal.commissionAmount ?? 0,
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Total Payable
                              </p>
                              <p className="font-semibold text-[#0F1923]">
                                ₹
                                {Number(
                                  deal.finalAmount ??
                                    totalValue +
                                      Number(
                                        deal.serviceFee ??
                                          deal.commissionAmount ??
                                          0,
                                      ),
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Payment</p>
                              <p className="font-medium text-[#374151] capitalize">
                                {deal.paymentStatus || "pending"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Location</p>
                              <p className="font-medium text-[#374151]">
                                {deal.listing?.location || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Compliance Year
                              </p>
                              <p className="font-medium text-[#374151]">
                                FY {deal.listing?.complianceYear || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl">
                            <p className="text-xs font-semibold text-[#6B7280] mb-3 uppercase tracking-wide">
                              Deal Progress
                            </p>
                            <div className="flex items-center gap-1 overflow-x-auto">
                              {stages.map((stage, index) => {
                                const done = currentIndex >= index;
                                return (
                                  <div
                                    key={stage.key}
                                    className="flex items-center gap-1 shrink-0"
                                  >
                                    <div
                                      className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
                                        done
                                          ? "bg-[#5AC361] text-white"
                                          : "bg-[#F0F4F8] text-[#9CA3AF]"
                                      }`}
                                    >
                                      {stage.label}
                                    </div>
                                    {index < stages.length - 1 && (
                                      <div
                                        className={`w-3 h-0.5 ${done ? "bg-[#5AC361]" : "bg-[#E5EAF0]"}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                            <p className="text-xs text-[#1D4ED8]">
                              EPR Nexus manages the transaction, payment
                              coordination, and seller communication.
                            </p>
                          </div>

                          {deal.notes && (
                            <div className="mt-3">
                              <p className="text-xs text-[#9CA3AF]">
                                Deal Notes
                              </p>
                              <p className="text-sm text-[#374151] mt-1">
                                {deal.notes}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex justify-end">
                            <DealRoom deal={deal} role="buyer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {active === "watchlist" && (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#E5EAF0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-[#0F1923]">
                  Watchlist
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Saved EPR credits you want to compare or revisit.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("marketplace")}
              >
                Browse Marketplace
              </Button>
            </div>

            {watchlistLoading ? (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-xl border border-[#E5EAF0] bg-[#F8FAFC]"
                  />
                ))}
              </div>
            ) : watchlistError ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-medium text-[#D92D20]">
                  {watchlistError}
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={fetchWatchlist}
                >
                  Try again
                </Button>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-[#98A2B3]">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.5L6 21V4.75z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-[#344054]">
                  Your watchlist is empty
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#667085]">
                  Save credits from the marketplace when you find listings you
                  want to compare later.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => onNavigate("marketplace")}
                >
                  Find credits
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {watchlist.map((listing) => {
                  const unavailable =
                    listing.status !== "active" ||
                    Number(listing.quantity || 0) <= 0;

                  return (
                    <div
                      key={listing._id}
                      className="rounded-xl border border-[#E5EAF0] bg-white p-4 transition-all hover:border-[#D5DEE7] hover:shadow-[0_8px_24px_rgba(16,24,40,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate("credit-detail", listing._id)
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF8EC] text-[#3EA646]">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.7}
                            >
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-heading text-sm font-bold text-[#101828]">
                              {listing.category} EPR Credits
                            </span>
                            <span className="mt-1 block truncate text-xs text-[#667085]">
                              {listing.sellerId?.company ||
                                listing.sellerId?.name ||
                                "Verified seller"}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromWatchlist(listing._id)}
                          className="shrink-0 rounded-lg p-2 text-[#98A2B3] transition-colors hover:bg-[#FEF2F2] hover:text-[#D92D20]"
                          title="Remove from watchlist"
                          aria-label={`Remove ${listing.category} from watchlist`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.5L6 21V4.75z" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[#98A2B3]">Price</p>
                          <p className="mt-0.5 font-semibold text-[#3EA646]">
                            ₹
                            {Number(listing.price || 0).toLocaleString("en-IN")}{" "}
                            / MT
                          </p>
                        </div>
                        <div>
                          <p className="text-[#98A2B3]">Available</p>
                          <p className="mt-0.5 font-semibold text-[#344054]">
                            {Number(listing.quantity || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            MT
                          </p>
                        </div>
                        <div>
                          <p className="text-[#98A2B3]">Location</p>
                          <p className="mt-0.5 truncate font-medium text-[#344054]">
                            {listing.location || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#98A2B3]">Compliance</p>
                          <p className="mt-0.5 font-medium text-[#344054]">
                            FY {listing.complianceYear || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0F2F5] pt-3">
                        {unavailable ? (
                          <Badge
                            label={
                              listing.status === "active"
                                ? "Sold Out"
                                : "Unavailable"
                            }
                          />
                        ) : (
                          <Badge label="Active" />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate("credit-detail", listing._id)
                          }
                          className="text-xs font-semibold text-[#2E7D32] hover:underline"
                        >
                          View listing →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {active === "disputes" && <DisputesPage role="buyer" />}

        {active === "messages" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0]">
              <h2 className="font-semibold text-[#0F1923]">Messages</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Private communication with EPR Nexus. Quotations are shown
                separately in Quotations.
              </p>
            </div>
            {buyerRequests.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#9CA3AF]">
                No conversations yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E5EAF0]">
                {buyerRequests.map((request) => {
                  const unread = Number(
                    messageUnreadByRequest[String(request._id)] || 0,
                  );
                  return (
                    <div
                      key={request._id}
                      className={`p-5 flex items-center justify-between gap-4 ${unread ? "bg-[#F0FBF1]" : ""}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0F1923]">
                            {request.listing?.category || "Credit request"}
                          </p>
                          {unread > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#EF4444]"
                              title="Unread messages"
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {request.requestedQuantity || 0} MT ·{" "}
                          {unread
                            ? `${unread} unread message${unread === 1 ? "" : "s"}`
                            : "No unread messages"}
                        </p>
                      </div>
                      <MessageChat
                        requestId={request._id}
                        role="buyer"
                        compact
                        onRead={markRequestMessagesRead}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {active === "profile" && (
          <Card>
            <div className="px-5 py-4 border-b border-[#E5EAF0]">
              <h2 className="font-semibold text-[#0F1923]">Profile</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Manage your account details and verification status.
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">
                Use the profile menu in the top navigation to view or edit your
                account details, verification status, and logout.
              </p>
            </div>
          </Card>
        )}
      </DashboardShell>
    </>
  );
}
export { BuyerDashboard as default };
