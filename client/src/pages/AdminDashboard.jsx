import { useEffect, useState } from "react";
import { NotificationBell, AdminProfileMenu } from "../components/AccountTools.jsx";
import QuotationCenter from "../components/QuotationCenter.jsx";
import ManagedMessagesPage from "./ManagedMessagesPage.jsx";
import api from "../services/api.js";
import {
  Badge,
  Button,
  Card,
  StatCard,
  Table,
  Tr,
  Td,
  Textarea,
} from "../components/ui";
const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "requests", label: "Purchase Requests" },
  { id: "quotations", label: "Quotations" },
  { id: "listings", label: "Seller Listings" },
  {
    id: "verification",
    label: "Doc Verification",
    badge: 0,
  },
  { id: "deals", label: "Deals / Transactions" },
  { id: "messages", label: "Messages" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];
function NavIcon({ id }) {
  const icons = {
    dashboard: (
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
    requests: (
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
    listings: (
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
    verification: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    quotations: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h4m-6 4h8m-8 4h5" />
      </svg>
    ),
    deals: (
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
    messages: (
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
    reports: (
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    settings: (
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  };
  return icons[id] ?? <></>;
}
function VerificationQueue({ kycDocuments, kycLoading, kycError, reviewKyc }) {
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!selected && kycDocuments.length > 0) {
      setSelected(kycDocuments[0]);
      return;
    }

    if (
      selected &&
      !kycDocuments.some((document) => document._id === selected._id)
    ) {
      setSelected(kycDocuments[0] ?? null);
    }
  }, [kycDocuments, selected]);

  const formatDocumentType = (type) => {
    if (!type) return "Document";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleReject = async () => {
    if (!selected || !reason.trim()) return;

    await reviewKyc(selected._id, "rejected", reason.trim());

    setReason("");
  };

  const handleApprove = async () => {
    if (!selected) return;

    await reviewKyc(selected._id, "approved");
  };

  return (
    <div className="flex gap-5">
      <div className="w-72 flex-shrink-0">
        <Card>
          <div className="px-4 py-3 border-b border-[#E5EAF0]">
            <h3
              className="font-semibold text-[#0F1923] text-sm"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Pending Verification
            </h3>
          </div>

          {kycLoading ? (
            <div className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
              Loading verification requests...
            </div>
          ) : kycError ? (
            <div className="px-4 py-8 text-center text-sm text-[#EF4444]">
              {kycError}
            </div>
          ) : kycDocuments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
              No pending KYC documents.
            </div>
          ) : (
            kycDocuments.map((document) => (
              <button
                type="button"
                key={document._id}
                onClick={() => {
                  setSelected(document);
                  setReason("");
                }}
                className={`w-full text-left px-4 py-3 border-b border-[#F0F4F8] hover:bg-[#F7F9FB] transition-colors ${
                  selected?._id === document._id ? "bg-[#EBF8EC]" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#374151]">
                    {formatDocumentType(document.type)}
                  </span>
                  <Badge label="Pending" />
                </div>

                <p className="text-xs text-[#6B7280]">
                  {document.owner?.company || "Unknown company"}
                </p>

                <p className="text-xs text-[#9CA3AF]">{document.fileName}</p>
              </button>
            ))
          )}
        </Card>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {formatDocumentType(selected.type)} —{" "}
                  {selected.owner?.company || "Unknown company"}
                </h3>

                <p className="text-xs text-[#6B7280] mt-1">
                  {selected.owner?.name || "—"} · {selected.owner?.email || "—"}
                </p>
              </div>

              <Badge label="Pending" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#6B7280] mb-3 uppercase tracking-wide">
                  Submitted Information
                </p>

                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: "Company",
                      value: selected.owner?.company || "—",
                    },
                    {
                      label: "Name",
                      value: selected.owner?.name || "—",
                    },
                    {
                      label: "Email",
                      value: selected.owner?.email || "—",
                    },
                    {
                      label: "Phone",
                      value: selected.owner?.phone || "—",
                    },
                    {
                      label: "Document",
                      value: selected.fileName || "—",
                    },
                    {
                      label: "Type",
                      value: formatDocumentType(selected.type),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-[#9CA3AF]">{item.label}</span>
                      <span className="font-medium text-[#374151] text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">
                  Uploaded Document
                </p>

                <div className="flex-1 min-h-[160px] border-2 border-dashed border-[#E5EAF0] rounded-xl flex flex-col items-center justify-center gap-2 bg-white">
                  <svg
                    className="w-8 h-8 text-[#CBD5E1]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 18h10a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0013.172 3H7a2 2 0 00-2 2v11a2 2 0 002 2z"
                    />
                  </svg>

                  <p className="text-xs text-[#6B7280] text-center px-3">
                    {selected.fileName}
                  </p>

                  <a
                    href={`http://localhost:8000${selected.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#5AC361] hover:underline"
                  >
                    Open document
                  </a>
                </div>

                <p className="text-[10px] text-[#9CA3AF]">
                  Uploaded:{" "}
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("en-IN")
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[#F0F4F8] rounded-xl">
              <p className="text-xs font-semibold text-[#6B7280] mb-2">
                Audit Trail
              </p>

              <div className="text-xs text-[#9CA3AF] space-y-1">
                <p>
                  • Submitted by {selected.owner?.name || "Unknown user"} on{" "}
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("en-IN")
                    : "—"}
                </p>
                <p>• Current status: {selected.verificationStatus}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Textarea
                label="Rejection Reason (required if rejecting)"
                placeholder="Describe why this document is being rejected so the seller can resubmit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />

              <div className="flex gap-3">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!reason.trim()}
                >
                  Reject
                </Button>

                <Button className="flex-1" onClick={handleApprove}>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#9CA3AF]">
          <div className="text-center">
            <svg
              className="w-10 h-10 mx-auto mb-2 text-[#E5EAF0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l-2 5L9 9l11 4-5-2zm0 0l5 5"
              />
            </svg>
            <p className="text-sm">Select a document to review</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ onNavigate }) {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycDocuments, setKycDocuments] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycError, setKycError] = useState("");
  const [listings, setListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState("");
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [deals, setDeals] = useState([]);
  const [dealLoading, setDealLoading] = useState(true);
  const [dealError, setDealError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);

  const fetchPurchaseRequests = async () => {
    try {
      setRequestLoading(true);
      setRequestError("");

      const response = await api.get("/requests/admin");

      if (response.data.success) {
        setPurchaseRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch purchase requests:", error);

      setRequestError(
        error.response?.data?.message || "Failed to load purchase requests.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setDealLoading(true);
      setDealError("");

      const response = await api.get("/deals/admin");

      if (response.data.success) {
        setDeals(response.data.deals);
      }
    } catch (error) {
      console.error("Failed to fetch deals:", error);

      setDealError(
        error.response?.data?.message ||
          "Failed to load deals.",
      );
    } finally {
      setDealLoading(false);
    }
  };

  const fetchMessageUnreadCount = async () => {
    try {
      const response = await api.get("/requests/messages/unread-count");
      if (response.data.success) setMessageUnreadCount(Number(response.data.unreadCount || 0));
    } catch (error) {
      console.error("Failed to fetch message unread count:", error);
    }
  };

  const markMessagesRead = async () => {
    await fetchMessageUnreadCount();
  };

  const updateDealStatus = async (
    dealId,
    status,
    paymentStatus,
  ) => {
    try {
      const response = await api.patch(
        `/deals/${dealId}/status`,
        {
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
        },
      );

      if (response.data.success) {
        await fetchDeals();
        await fetchPurchaseRequests();
      }
    } catch (error) {
      console.error("Deal status update failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update deal.",
      );
    }
  };

  const reviewPurchaseRequest = async (
    requestId,
    status,
    rejectionReason = "",
  ) => {
    try {
      const response = await api.patch(`/requests/admin/${requestId}`, {
        status,
        rejectionReason,
      });

      if (response.data.success) {
        await fetchPurchaseRequests();
      }
    } catch (error) {
      console.error("Purchase request review failed:", error);

      alert(
        error.response?.data?.message || "Failed to update purchase request.",
      );
    }
  };

  const fetchKycDocuments = async () => {
    try {
      setKycLoading(true);
      setKycError("");

      const response = await api.get("/admin/kyc");

      if (response.data.success) {
        setKycDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch KYC:", error);

      setKycError(
        error.response?.data?.message || "Failed to load KYC documents.",
      );
    } finally {
      setKycLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setListingLoading(true);
      setListingError("");

      const response = await api.get("/admin/listings");

      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);

      setListingError(
        error.response?.data?.message || "Failed to load seller listings.",
      );
    } finally {
      setListingLoading(false);
    }
  };

  const reviewListing = async (listingId, status, rejectionReason = "") => {
    try {
      const response = await api.patch(`/admin/listings/${listingId}`, {
        status,
        rejectionReason,
      });

      if (response.data.success) {
        await fetchListings();
      }
    } catch (error) {
      console.error("Listing review failed:", error);

      alert(error.response?.data?.message || "Failed to review listing.");
    }
  };

  const reviewKyc = async (documentId, status, rejectionReason = "") => {
    try {
      const response = await api.patch(`/admin/kyc/${documentId}`, {
        status,
        rejectionReason,
      });

      if (response.data.success) {
        await fetchKycDocuments();
      }

      return response.data;
    } catch (error) {
      console.error("KYC review failed:", error);

      alert(error.response?.data?.message || "Failed to review document.");

      throw error;
    }
  };

  useEffect(() => {
    fetchKycDocuments();
    fetchListings();
    fetchPurchaseRequests();
    fetchDeals();
    fetchMessageUnreadCount();
    const interval = window.setInterval(fetchMessageUnreadCount, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const totalCommission = deals.reduce(
    (sum, deal) =>
      sum + Number(deal.commissionAmount || 0),
    0,
  );

  const inProgressDeals = deals.filter(
    (deal) =>
      deal.status === "matched" ||
      deal.status === "negotiating" ||
      deal.status === "terms_agreed" ||
      deal.status === "payment_coordination",
  ).length;

  const completedDeals = deals.filter(
    (deal) => deal.status === "completed",
  ).length;
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0F1923] flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:flex`}
      >
        <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2">
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
              className="text-sm font-bold text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              EPR Nexus
            </p>
            <p className="text-[10px] text-white/50">Admin Control Center</p>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5AC361] text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Super Admin</p>
              <p className="text-[10px] text-white/40">admin@eprnexus.in</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setActive(n.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${active === n.id ? "bg-[#5AC361] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <div className="flex items-center gap-2.5">
                <NavIcon id={n.id} />
                {n.label}
              </div>
              {(n.id === "verification"
                ? kycDocuments.length
                : n.id === "listings"
                  ? listings.length
                  : n.id === "requests"
                    ? purchaseRequests.filter((request) => request.status === "pending").length
                    : n.id === "quotations"
                      ? purchaseRequests.filter((request) => request.offer?.finalAmount != null && !request.offer?.acceptedAt).length
                      : n.id === "messages"
                        ? messageUnreadCount
                        : n.badge) > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active === n.id ? "bg-white/20" : "bg-[#EF4444] text-white"
                  }`}
                >
                  {n.id === "verification"
                    ? kycDocuments.length
                    : n.id === "listings"
                      ? listings.length
                      : n.id === "requests"
                        ? purchaseRequests.filter((request) => request.status === "pending").length
                        : n.id === "quotations"
                          ? purchaseRequests.filter((request) => request.offer?.finalAmount != null && !request.offer?.acceptedAt).length
                          : n.id === "messages"
                            ? messageUnreadCount
                            : n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-white/10">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white w-full transition-colors"
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
        <div className="bg-white border-b border-[#E5EAF0] px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1
            className="text-base font-semibold text-[#0F1923]"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {NAV.find((n) => n.id === active)?.label ?? "Admin Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate("home")}>Home</Button>
            <NotificationBell compact onNavigate={onNavigate} />
            <AdminProfileMenu onNavigate={onNavigate} compact />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-7xl">
          {active === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="New Requests"
                  value={purchaseRequests.filter((request) => request.status === "pending").length}
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
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Deals in Progress"
                  value={inProgressDeals}
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
                <StatCard
                  label="Total Commission (₹)"
                  value={`₹${totalCommission.toLocaleString("en-IN")}`}
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Pending verification alert */}
              <div className="mb-5 p-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#F59E0B] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#92400E]">
                    {kycDocuments.length} documents awaiting verification
                  </p>
                  <p className="text-xs text-[#B45309] mt-0.5">
                    Review submitted business documents and approve or reject
                    them
                  </p>
                </div>
                <Button size="sm" onClick={() => setActive("verification")}>
                  Review Now
                </Button>
              </div>

              <Card>
                <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                  <div>
                    <h2
                      className="font-semibold text-[#0F1923]"
                      style={{
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      Recent Purchase Requests
                    </h2>

                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Buyer requests submitted through the marketplace.
                    </p>
                  </div>

                  <button
                    className="text-sm text-[#5AC361] font-medium hover:underline"
                    onClick={() => setActive("requests")}
                  >
                    View All →
                  </button>
                </div>

                <Table
                  headers={[
                    "Buyer",
                    "Seller",
                    "Credit Type",
                    "Qty (MT)",
                    "Price (₹/MT)",
                    "Status",
                    "Action",
                  ]}
                >
                  {requestLoading ? (
                    <Tr>
                      <Td colSpan={7}>
                        <div className="py-8 text-center text-gray-500">
                          Loading purchase requests...
                        </div>
                      </Td>
                    </Tr>
                  ) : requestError ? (
                    <Tr>
                      <Td colSpan={7}>
                        <div className="py-8 text-center text-red-500">
                          {requestError}
                        </div>
                      </Td>
                    </Tr>
                  ) : purchaseRequests.length === 0 ? (
                    <Tr>
                      <Td colSpan={7}>
                        <div className="py-8 text-center text-gray-500">
                          No purchase requests found.
                        </div>
                      </Td>
                    </Tr>
                  ) : (
                    purchaseRequests.slice(0, 5).map((request) => (
                      <Tr key={request._id}>
                        <Td>
                          <span className="font-medium">
                            {request.companyName ||
                              request.buyerId?.company ||
                              request.buyerId?.name ||
                              "—"}
                          </span>
                        </Td>

                        <Td>
                          {request.listingId?.sellerId?.company ||
                            request.listingId?.sellerId?.name ||
                            "—"}
                        </Td>

                        <Td>{request.listingId?.category || "—"}</Td>

                        <Td>{request.quantity}</Td>

                        <Td>₹{request.listingId?.price ?? "—"}</Td>

                        <Td>
                          <Badge label={request.status} />
                        </Td>

                        <Td>
                          <div className="flex gap-2 flex-wrap">
                            {!["approved", "completed", "cancelled", "rejected"].includes(request.status) && (
                              <Button
                                size="sm"
                                onClick={() => { setSelectedRequestId(request._id); setActive("quotations"); }}
                              >
                                Manage Request
                              </Button>
                            )}

                            {request.status === "pending" && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  const reason = window.prompt(
                                    "Enter rejection reason:",
                                  );

                                  if (reason?.trim()) {
                                    reviewPurchaseRequest(
                                      request._id,
                                      "rejected",
                                      reason.trim(),
                                    );
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Table>
              </Card>
            </>
          )}

          {active === "listings" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Seller Listings
                  </h2>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Review listings submitted by verified sellers.
                  </p>
                </div>

                <Badge label={`${listings.length} Pending`} />
              </div>

              {listingLoading ? (
                <div className="py-12 text-center text-[#9CA3AF]">
                  Loading seller listings...
                </div>
              ) : listingError ? (
                <div className="py-12 text-center text-[#EF4444]">
                  {listingError}
                </div>
              ) : listings.length === 0 ? (
                <div className="py-12 text-center text-[#9CA3AF]">
                  No pending seller listings.
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {listings.map((listing) => (
                    <div key={listing._id} className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className="font-semibold text-[#0F1923]"
                              style={{
                                fontFamily: "Outfit, sans-serif",
                              }}
                            >
                              {listing.category}
                            </h3>

                            <Badge label="Pending Review" />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Seller</p>
                              <p className="font-medium text-[#374151]">
                                {listing.sellerId?.company ||
                                  listing.sellerId?.name ||
                                  "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">Quantity</p>
                              <p className="font-medium text-[#374151]">
                                {listing.quantity} MT
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">Price</p>
                              <p className="font-medium text-[#374151]">
                                ₹{listing.price}/MT
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">Location</p>
                              <p className="font-medium text-[#374151]">
                                {listing.location}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Compliance Year
                              </p>
                              <p className="font-medium text-[#374151]">
                                FY {listing.complianceYear}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Valid Till
                              </p>
                              <p className="font-medium text-[#374151]">
                                {listing.validTill
                                  ? new Date(
                                      listing.validTill,
                                    ).toLocaleDateString("en-IN")
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          {listing.description && (
                            <div className="mt-4 p-3 bg-[#F7F9FB] rounded-lg">
                              <p className="text-xs text-[#9CA3AF] mb-1">
                                Description
                              </p>
                              <p className="text-sm text-[#374151]">
                                {listing.description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 lg:w-44">
                          {listing.documentId?.fileUrl && (
                            <a
                              href={`http://localhost:8000${listing.documentId.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-[#E5EAF0] px-4 py-2 text-sm text-center text-[#374151] hover:bg-[#F7F9FB]"
                            >
                              View Proof
                            </a>
                          )}

                          <Button
                            onClick={() => reviewListing(listing._id, "active")}
                          >
                            Approve & Publish
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => {
                              const reason = window.prompt(
                                "Enter rejection reason:",
                              );

                              if (reason?.trim()) {
                                reviewListing(
                                  listing._id,
                                  "rejected",
                                  reason.trim(),
                                );
                              }
                            }}
                          >
                            Reject Listing
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {active === "verification" && (
            <VerificationQueue
              kycDocuments={kycDocuments}
              kycLoading={kycLoading}
              kycError={kycError}
              reviewKyc={reviewKyc}
            />
          )}

          {active === "requests" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Purchase Requests
                  </h2>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Manage buyer requests submitted through the marketplace.
                  </p>
                </div>

                <Badge label={`${purchaseRequests.length} Total`} />
              </div>

              {requestLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading purchase requests...
                </div>
              ) : requestError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {requestError}
                </div>
              ) : purchaseRequests.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  <p className="text-lg font-semibold text-[#374151]">
                    No purchase requests
                  </p>

                  <p className="text-sm mt-1">
                    Buyer requests will appear here when submitted.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {purchaseRequests.map((request) => {
                    const listing = request.listingId;
                    const buyer = request.buyerId;
                    const seller = listing?.sellerId;

                    return (
                      <div key={request._id} className="p-5">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                          {/* Request information */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                              <h3
                                className="font-semibold text-[#0F1923]"
                                style={{
                                  fontFamily: "Outfit, sans-serif",
                                }}
                              >
                                Request #{request._id.slice(-6)}
                              </h3>

                              <Badge label={request.status} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Buyer
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {request.companyName ||
                                    buyer?.company ||
                                    buyer?.name ||
                                    "—"}
                                </p>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  {request.email || buyer?.email || "—"}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Seller
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {seller?.company || seller?.name || "—"}
                                </p>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  {seller?.email || "—"}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Credit Type
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {listing?.category || "—"}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Requested Quantity
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {request.quantity} MT
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Listed Price
                                </p>
                                <p className="font-medium text-[#374151]">
                                  ₹{listing?.price ?? "—"} / MT
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Estimated Value
                                </p>
                                <p className="font-semibold text-[#5AC361]">
                                  ₹
                                  {(
                                    Number(request.quantity || 0) *
                                    Number(listing?.price || 0)
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Location
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {listing?.location || "—"}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Compliance Year
                                </p>
                                <p className="font-medium text-[#374151]">
                                  FY {listing?.complianceYear || "—"}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Submitted
                                </p>
                                <p className="font-medium text-[#374151]">
                                  {request.createdAt
                                    ? new Date(
                                        request.createdAt,
                                      ).toLocaleString("en-IN")
                                    : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-4">
                              <p className="text-xs font-semibold text-[#6B7280] mb-2 uppercase tracking-wide">
                                Request Details
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-[#9CA3AF]">
                                    Contact Person
                                  </span>
                                  <p className="font-medium text-[#374151]">
                                    {request.contactPerson || "—"}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[#9CA3AF]">Phone</span>
                                  <p className="font-medium text-[#374151]">
                                    {request.phone || "—"}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[#9CA3AF]">GST</span>
                                  <p className="font-medium text-[#374151]">
                                    {request.gstNumber || "—"}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[#9CA3AF]">Email</span>
                                  <p className="font-medium text-[#374151]">
                                    {request.email || "—"}
                                  </p>
                                </div>
                              </div>

                              {request.notes && (
                                <div className="mt-3 pt-3 border-t border-[#E5EAF0]">
                                  <span className="text-[#9CA3AF] text-xs">
                                    Notes
                                  </span>

                                  <p className="text-sm text-[#374151] mt-1">
                                    {request.notes}
                                  </p>
                                </div>
                              )}

                              {request.rejectionReason && (
                                <div className="mt-3 p-3 bg-[#FEF2F2] rounded-lg">
                                  <span className="text-xs font-semibold text-[#991B1B]">
                                    Rejection Reason
                                  </span>

                                  <p className="text-sm text-[#B91C1C] mt-1">
                                    {request.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 xl:w-48">
                            {!["approved", "completed", "cancelled", "rejected"].includes(request.status) && (
                              <Button
                                onClick={() => { setSelectedRequestId(request._id); setActive("quotations"); }}
                              >
                                Manage Request
                              </Button>
                            )}

                            {request.status === "pending" && (
                              <Button
                                variant="danger"
                                onClick={() => {
                                  const reason = window.prompt(
                                    "Enter rejection reason:",
                                  );

                                  if (reason?.trim()) {
                                    reviewPurchaseRequest(
                                      request._id,
                                      "rejected",
                                      reason.trim(),
                                    );
                                  }
                                }}
                              >
                                Reject Request
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {active === "quotations" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#0F1923]" style={{ fontFamily: "Outfit, sans-serif" }}>Quotations</h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">Create and revise buyer quotations. Messages are handled separately.</p>
                </div>
              </div>
              <QuotationCenter initialRequestId={selectedRequestId} />
            </div>
          )}

          {active === "deals" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-base font-semibold text-[#0F1923] mb-1"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Deal Mediation Workspace
                  </h2>
                  <p className="text-xs text-[#9CA3AF]">
                    Manage matched transactions through completion.
                  </p>
                </div>
                <Badge label={`${deals.length} Deals`} />
              </div>

              {dealLoading ? (
                <Card className="p-10">
                  <div className="text-center text-[#9CA3AF]">
                    Loading deals...
                  </div>
                </Card>
              ) : dealError ? (
                <Card className="p-10">
                  <div className="text-center text-[#EF4444]">
                    {dealError}
                  </div>
                </Card>
              ) : deals.length === 0 ? (
                <Card className="p-10">
                  <div className="text-center">
                    <p className="text-base font-semibold text-[#374151]">
                      No deals yet
                    </p>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                      Matched purchase requests will appear here.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {deals.map((deal) => {
                    const listing = deal.listingId || {};
                    const buyer = deal.buyerId || {};
                    const seller = deal.sellerId || {};

                    const stages = [
                      { key: "matched", label: "Matched" },
                      { key: "terms_agreed", label: "Quotation Accepted" },
                      { key: "payment_coordination", label: "Payment Coordination" },
                      { key: "completed", label: "Deal Completed" },
                    ];

                    const currentIndex = stages.findIndex(
                      (stage) => stage.key === deal.status,
                    );
                    const normalizedIndex =
                      deal.status === "cancelled" ? -1 : currentIndex === -1 ? 0 : currentIndex;

                    return (
                      <Card key={deal._id} className="p-5">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className="font-semibold text-[#0F1923]"
                                style={{ fontFamily: "Outfit, sans-serif" }}
                              >
                                Deal #{deal._id.slice(-6)} —{" "}
                                {listing.category || "EPR Credits"}
                              </span>
                              <Badge
                                label={deal.status.replaceAll("_", " ")}
                              />
                            </div>
                            <p className="text-xs text-[#9CA3AF]">
                              Created{" "}
                              {deal.createdAt
                                ? new Date(deal.createdAt).toLocaleString("en-IN")
                                : "—"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-[#9CA3AF]">
                              Commission
                            </p>
                            <p className="font-bold text-[#5AC361]">
                              ₹{Number(deal.commissionAmount || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                            <p className="text-xs text-[#9CA3AF] mb-1">
                              Buyer
                            </p>
                            <p className="font-semibold text-[#374151]">
                              {buyer.company || buyer.name || "Buyer"}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-1">
                              {deal.quantity} MT · ₹
                              {Number(deal.agreedPrice || 0).toLocaleString("en-IN")}/MT
                            </p>
                          </div>

                          <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                            <p className="text-xs text-[#9CA3AF] mb-1">
                              Seller
                            </p>
                            <p className="font-semibold text-[#374151]">
                              {seller.company || seller.name || "Seller"}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-1">
                              {listing.location || "—"} · FY{" "}
                              {listing.complianceYear || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 overflow-x-auto">
                          <div className="flex items-center gap-1 min-w-max">
                            {stages.map((stage, index) => {
                              const done = index <= normalizedIndex;

                              return (
                                <div
                                  key={stage.key}
                                  className="flex items-center gap-1"
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
                                      className={`w-4 h-0.5 ${
                                        index < normalizedIndex
                                          ? "bg-[#5AC361]"
                                          : "bg-[#E5EAF0]"
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                          <div className="text-[#6B7280]">
                            <span>Total deal value: </span>
                            <strong className="text-[#374151]">
                              ₹
                              {(
                                Number(deal.quantity || 0) *
                                Number(deal.agreedPrice || 0)
                              ).toLocaleString("en-IN")}
                            </strong>
                            <span className="mx-2 text-[#D1D5DB]">•</span>
                            <span>Payment: </span>
                            <strong className="capitalize text-[#374151]">
                              {deal.paymentStatus || "pending"}
                            </strong>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {deal.status === "matched" && (
                              <Button size="sm" onClick={() => updateDealStatus(deal._id, "terms_agreed")}>
                                Confirm Terms
                              </Button>
                            )}

                            {deal.status === "terms_agreed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateDealStatus(
                                    deal._id,
                                    "payment_coordination",
                                    "initiated",
                                  )
                                }
                              >
                                Start Payment
                              </Button>
                            )}

                            {deal.status === "payment_coordination" && deal.paymentStatus !== "received" && (
                              <Button size="sm" onClick={() => updateDealStatus(deal._id, "payment_coordination", "received")}>
                                Mark Payment Received
                              </Button>
                            )}

                            {deal.status === "payment_coordination" && deal.paymentStatus === "received" && (
                              <Button size="sm" onClick={() => updateDealStatus(deal._id, "completed", "received")}>
                                Mark Completed
                              </Button>
                            )}

                            {deal.status !== "completed" &&
                              deal.status !== "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    updateDealStatus(
                                      deal._id,
                                      "cancelled",
                                    )
                                  }
                                >
                                  Cancel Deal
                                </Button>
                              )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {active === "reports" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <h2
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Commission & Deal Reports
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDeals}
                >
                  Refresh
                </Button>
              </div>

              {dealLoading ? (
                <div className="py-12 text-center text-[#9CA3AF]">
                  Loading deal reports...
                </div>
              ) : dealError ? (
                <div className="py-12 text-center text-[#EF4444]">
                  {dealError}
                </div>
              ) : (
                <>
                  <Table
                    headers={[
                      "Deal ID",
                      "Buyer",
                      "Seller",
                      "Type",
                      "Qty (MT)",
                      "Price (₹/MT)",
                      "Commission (₹)",
                      "Status",
                      "Date",
                    ]}
                  >
                    {deals.map((deal) => (
                      <Tr key={deal._id}>
                        <Td>
                          <span className="font-mono text-xs">
                            #{deal._id.slice(-6)}
                          </span>
                        </Td>
                        <Td>
                          {deal.buyerId?.company ||
                            deal.buyerId?.name ||
                            "—"}
                        </Td>
                        <Td>
                          <span className="font-mono text-xs">
                            {deal.sellerId?.company ||
                              deal.sellerId?.name ||
                              "—"}
                          </span>
                        </Td>
                        <Td>
                          {deal.listingId?.category || "—"}
                        </Td>
                        <Td>{deal.quantity}</Td>
                        <Td>
                          ₹{Number(deal.agreedPrice || 0).toLocaleString("en-IN")}
                        </Td>
                        <Td>
                          <span className="font-semibold text-[#5AC361]">
                            ₹
                            {Number(
                              deal.commissionAmount || 0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </Td>
                        <Td>
                          <Badge
                            label={deal.status.replaceAll("_", " ")}
                          />
                        </Td>
                        <Td>
                          {deal.createdAt
                            ? new Date(deal.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Table>

                  <div className="px-5 py-3 border-t border-[#E5EAF0] flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">
                      Total commission earned
                    </span>
                    <span
                      className="font-bold text-[#0F1923] text-lg"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      ₹{totalCommission.toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}
            </Card>
          )}

          {active === "messages" && (
            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#0F1923]" style={{ fontFamily: "Outfit, sans-serif" }}>Messages</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Open any request to read the controlled conversation and message either the buyer or seller separately.</p>
              </div>
              <ManagedMessagesPage initialRequestId={selectedRequestId} onRead={markMessagesRead} />
            </div>
          )}

          {active === "settings" && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F0F4F8] flex items-center justify-center text-[#9CA3AF] mb-3"><NavIcon id="settings" /></div>
              <p className="font-semibold text-[#374151]">Settings</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Platform settings will be added here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export { AdminDashboard as default };