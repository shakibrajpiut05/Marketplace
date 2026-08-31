import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { NotificationBell, ProfileMenu } from "../components/AccountTools.jsx";
import {
  Badge,
  Button,
  Card,
  PageHeader,
  SectionHeader,
  StatCard,
  Table,
  Tr,
  Td,
} from "../components/ui";
import { DealRoom } from "../components/DealRoom.jsx";
import { DisputesPage } from "../components/DisputeCenter.jsx";
import { MessageChat } from "../components/MessageCenter.jsx";
import { useEffect, useMemo, useState } from "react";
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
    id: "listings",
    label: "My Listings",
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
    id: "requests",
    label: "Purchase Requests",
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "deals",
    label: "My Deals",
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
    id: "documents",
    label: "Documents",
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
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
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
function SellerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [sellerDeals, setSellerDeals] = useState([]);
  const [dealLoading, setDealLoading] = useState(true);
  const [dealError, setDealError] = useState("");
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [messageUnreadByRequest, setMessageUnreadByRequest] = useState({});

  const sellerCompany = user?.company?.trim() || user?.name?.trim() || "Seller";
  const sellerName = user?.name?.trim() || "Seller";
  const sellerInitial = sellerCompany.slice(0, 1).toUpperCase();

  const fetchMessageUnread = async () => {
    try {
      const response = await api.get("/requests/messages/unread-count");
      if (response.data.success) {
        setMessageUnreadCount(Number(response.data.unreadCount || 0));
        setMessageUnreadByRequest(response.data.byRequest || {});
      }
    } catch (error) {
      console.error("Failed to fetch message unread count:", error);
    }
  };

  const markRequestMessagesRead = (requestId) => {
    const count = Number(messageUnreadByRequest[String(requestId)] || 0);
    setMessageUnreadByRequest((current) => {
      const next = { ...current };
      delete next[String(requestId)];
      return next;
    });
    setMessageUnreadCount((current) => Math.max(0, current - count));
  };

  const fetchSellerDeals = async () => {
    try {
      setDealLoading(true);
      setDealError("");

      const response = await api.get("/deals/seller");

      if (response.data.success) {
        setSellerDeals(response.data.deals);
      }
    } catch (error) {
      console.error("Failed to fetch seller deals:", error);

      setDealError(
        error.response?.data?.message || "Failed to load your deals.",
      );
    } finally {
      setDealLoading(false);
    }
  };

  const fetchPurchaseRequests = async () => {
    try {
      setRequestLoading(true);
      setRequestError("");

      const response = await api.get("/requests/seller");

      if (response.data.success) {
        setPurchaseRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch seller purchase requests:", error);

      setRequestError(
        error.response?.data?.message || "Failed to load purchase requests.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseRequests();
    fetchSellerDeals();
  }, []);
  useEffect(() => {
    fetchMessageUnread();
    const interval = window.setInterval(fetchMessageUnread, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const [sellerListings, setSellerListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState("");

  const fetchSellerListings = async () => {
    try {
      setListingLoading(true);
      setListingError("");

      const response = await api.get("/listings/seller");

      if (response.data.success) {
        setSellerListings(response.data.listings);
      }
    } catch (error) {
      console.error("Failed to fetch seller listings:", error);
      setListingError(
        error.response?.data?.message || "Failed to load your listings.",
      );
    } finally {
      setListingLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerListings();
  }, []);

  const rejectedListings = useMemo(
    () => sellerListings.filter((listing) => listing.status === "rejected"),
    [sellerListings],
  );

  // Only count unread messages that belong to requests actually visible
  // to this seller. This prevents stale/unrelated unread records from
  // showing a badge such as "5" when there are no conversations.
  const visibleUnreadCount = useMemo(
    () =>
      purchaseRequests.reduce(
        (total, request) =>
          total + Number(messageUnreadByRequest[String(request._id)] || 0),
        0,
      ),
    [purchaseRequests, messageUnreadByRequest],
  );

  const inventorySummary = useMemo(() => {
    const total = sellerListings.reduce(
      (sum, listing) =>
        sum + Number(listing.totalQuantity ?? listing.quantity ?? 0),
      0,
    );
    const available = sellerListings.reduce(
      (sum, listing) => sum + Number(listing.quantity || 0),
      0,
    );
    const reserved = sellerListings.reduce(
      (sum, listing) => sum + Number(listing.reservedQuantity || 0),
      0,
    );
    const sold = sellerListings.reduce((sum, listing) => {
      const listingTotal = Number(
        listing.totalQuantity ?? listing.quantity ?? 0,
      );
      const listingAvailable = Number(listing.quantity || 0);
      const listingReserved = Number(listing.reservedQuantity || 0);
      return (
        sum + Math.max(0, listingTotal - listingAvailable - listingReserved)
      );
    }, 0);

    return { total, available, reserved, sold };
  }, [sellerListings]);

  const actionItems = useMemo(() => {
    const items = [];
    const pendingListings = sellerListings.filter(
      (listing) => listing.status === "pending_review",
    ).length;
    const openRequests = purchaseRequests.filter((request) =>
      ["new", "reviewing", "matched", "negotiating"].includes(request.status),
    ).length;
    const unread = visibleUnreadCount;
    const paymentDeals = sellerDeals.filter(
      (deal) =>
        deal.status === "payment_coordination" &&
        ["pending", "initiated"].includes(deal.paymentStatus),
    ).length;

    if (openRequests > 0) {
      items.push({
        title: `${openRequests} purchase request${openRequests === 1 ? "" : "s"} need attention`,
        description: "Review buyer requests and keep conversations moving.",
        action: () => setActive("requests"),
        label: "Review requests",
        tone: "blue",
      });
    }

    if (unread > 0) {
      items.push({
        title: `${unread} unread message${unread === 1 ? "" : "s"}`,
        description: "A buyer has sent a new message in an active request.",
        action: () => setActive("messages"),
        label: "Open messages",
        tone: "red",
      });
    }

    if (paymentDeals > 0) {
      items.push({
        title: `${paymentDeals} deal${paymentDeals === 1 ? "" : "s"} awaiting payment`,
        description: "Payment coordination is in progress for these deals.",
        action: () => setActive("deals"),
        label: "View deals",
        tone: "amber",
      });
    }

    if (pendingListings > 0) {
      items.push({
        title: `${pendingListings} listing${pendingListings === 1 ? "" : "s"} awaiting review`,
        description: "EPR Nexus is reviewing these listings.",
        action: () => setActive("listings"),
        label: "View listings",
        tone: "amber",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "You're all caught up",
        description: "No urgent seller actions need your attention right now.",
        action: () => setActive("listings"),
        label: "View inventory",
        tone: "green",
      });
    }

    return items.slice(0, 3);
  }, [sellerListings, purchaseRequests, sellerDeals, visibleUnreadCount]);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-[#E5EAF0] flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:flex`}
      >
        {/* Brand */}
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
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              EPR Nexus
            </p>
            <p className="text-[10px] text-[#6B7280]">Seller Portal</p>
          </div>
        </div>

        {/* Seller info */}
        <div className="px-4 py-3 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EBF8EC] text-[#5AC361] flex items-center justify-center font-bold text-sm">
              {sellerInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#374151] truncate">
                {sellerCompany}
              </p>
              <p className="text-[10px] text-[#9CA3AF] truncate">
                {sellerName} · Seller account
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setActive(n.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${active === n.id ? "bg-[#EBF8EC] text-[#2E7D32]" : "text-[#6B7280] hover:bg-[#F7F9FB] hover:text-[#374151]"}`}
            >
              <span className="flex items-center gap-2.5">
                {n.icon}
                {n.label}
              </span>
              {n.id === "messages" && visibleUnreadCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active === n.id
                      ? "bg-white/60 text-[#2E7D32]"
                      : "bg-[#EF4444] text-white"
                  }`}
                >
                  {visibleUnreadCount > 99 ? "99+" : visibleUnreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-[#E5EAF0]">
          <button
            onClick={() => onNavigate("home")}
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

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
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
              {NAV.find((n) => n.id === active)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("home")}
            >
              Home
            </Button>
            <NotificationBell compact onNavigate={onNavigate} />
            <ProfileMenu compact onNavigate={onNavigate} />
            <Button size="sm" onClick={() => onNavigate("add-listing")}>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Listing
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-6xl">
          {active === "dashboard" && (
            <>
              <PageHeader
                eyebrow="Seller workspace"
                title={`Welcome back, ${sellerName}`}
                description="Manage your EPR inventory, buyer requests, and active transactions from one place."
                actions={
                  <Button onClick={() => onNavigate("add-listing")}>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add listing
                  </Button>
                }
              />

              <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="Total inventory"
                  value={`${inventorySummary.total.toLocaleString("en-IN")} MT`}
                  description="Across all your listings"
                  accent
                  icon={<span className="text-sm font-bold">MT</span>}
                />
                <StatCard
                  label="Available"
                  value={`${inventorySummary.available.toLocaleString("en-IN")} MT`}
                  description="Ready for purchase"
                  icon={<span className="text-sm font-bold">A</span>}
                />
                <StatCard
                  label="Reserved"
                  value={`${inventorySummary.reserved.toLocaleString("en-IN")} MT`}
                  description="Held for active deals"
                  icon={<span className="text-sm font-bold">R</span>}
                />
                <StatCard
                  label="Sold"
                  value={`${inventorySummary.sold.toLocaleString("en-IN")} MT`}
                  description={`${sellerDeals.filter((deal) => deal.status === "completed").length} completed deal${sellerDeals.filter((deal) => deal.status === "completed").length === 1 ? "" : "s"}`}
                  icon={<span className="text-sm font-bold">S</span>}
                />
              </div>

              <section className="mb-7">
                <SectionHeader
                  title="Action required"
                  description="The items most likely to need your attention next."
                />
                <div className="grid gap-3 lg:grid-cols-3">
                  {actionItems.map((item, index) => {
                    const tone = {
                      red: "border-[#FECACA] bg-[#FEF2F2]",
                      blue: "border-[#BFDBFE] bg-[#EFF6FF]",
                      amber: "border-[#FCD34D] bg-[#FFFBEB]",
                      green: "border-[#A5D6A7] bg-[#EBF8EC]",
                    }[item.tone];
                    const textTone = {
                      red: "text-[#991B1B]",
                      blue: "text-[#1D4ED8]",
                      amber: "text-[#92400E]",
                      green: "text-[#2E7D32]",
                    }[item.tone];
                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className={`rounded-xl border p-4 ${tone}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${textTone}`}>
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                              {item.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={item.action}
                            className={`shrink-0 text-xs font-bold ${textTone} hover:underline`}
                          >
                            {item.label}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                <Card className="overflow-hidden">
                  <div className="px-5 py-4">
                    <SectionHeader
                      className="mb-0"
                      title="Recent inventory"
                      description="Your latest EPR listings and their current status."
                      action={
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#3EA646] hover:underline"
                          onClick={() => setActive("listings")}
                        >
                          View all →
                        </button>
                      }
                    />
                  </div>
                  {listingLoading ? (
                    <div className="px-5 py-12 text-center text-sm text-[#667085]">
                      Loading your inventory...
                    </div>
                  ) : listingError ? (
                    <div className="px-5 py-12 text-center text-sm text-[#D92D20]">
                      {listingError}
                    </div>
                  ) : sellerListings.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm font-semibold text-[#344054]">
                        No listings yet
                      </p>
                      <p className="mt-1 text-sm text-[#667085]">
                        Create your first listing to start receiving buyer
                        requests.
                      </p>
                      <Button
                        className="mt-4"
                        size="sm"
                        onClick={() => onNavigate("add-listing")}
                      >
                        Add your first listing
                      </Button>
                    </div>
                  ) : (
                    <Table
                      headers={[
                        "Credit type",
                        "Available",
                        "Price / MT",
                        "Year",
                        "Status",
                      ]}
                    >
                      {sellerListings.slice(0, 5).map((listing) => (
                        <Tr key={listing._id}>
                          <Td>
                            <span className="font-semibold text-[#101828]">
                              {listing.category}
                            </span>
                          </Td>
                          <Td>
                            {Number(listing.quantity || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            MT
                          </Td>
                          <Td>
                            ₹
                            {Number(listing.price || 0).toLocaleString("en-IN")}
                          </Td>
                          <Td>{listing.complianceYear || "—"}</Td>
                          <Td>
                            <Badge
                              label={
                                listing.status === "pending_review"
                                  ? "Pending"
                                  : listing.status
                              }
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Table>
                  )}
                </Card>

                <Card className="p-5">
                  <SectionHeader
                    title="Recent deals"
                    description="Your latest transaction activity."
                    action={
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#3EA646] hover:underline"
                        onClick={() => setActive("deals")}
                      >
                        View all →
                      </button>
                    }
                  />
                  {dealLoading ? (
                    <div className="py-8 text-center text-sm text-[#667085]">
                      Loading deals...
                    </div>
                  ) : dealError ? (
                    <div className="py-8 text-center text-sm text-[#D92D20]">
                      {dealError}
                    </div>
                  ) : sellerDeals.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#DCE3EA] bg-[#F8FAFC] px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-[#344054]">
                        No deals yet
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#667085]">
                        Completed and active transactions will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sellerDeals.slice(0, 4).map((deal) => {
                        const statusLabel =
                          {
                            matched: "Matched",
                            negotiating: "Negotiating",
                            terms_agreed: "Terms Agreed",
                            payment_coordination: "Payment Coordination",
                            completed: "Completed",
                            cancelled: "Cancelled",
                          }[deal.status] || deal.status;
                        return (
                          <button
                            key={deal._id}
                            type="button"
                            onClick={() => setActive("deals")}
                            className="w-full rounded-xl border border-[#E5EAF0] p-3.5 text-left transition hover:border-[#C8D1DB] hover:bg-[#FAFBFC]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#101828]">
                                  {deal.listing?.category || "EPR Credit Deal"}
                                </p>
                                <p className="mt-1 text-xs text-[#667085]">
                                  #{deal._id?.slice(-8)} ·{" "}
                                  {Number(deal.quantity || 0).toLocaleString(
                                    "en-IN",
                                  )}{" "}
                                  MT
                                </p>
                              </div>
                              <Badge label={statusLabel} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}

          {active === "listings" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <h2
                  className="font-semibold text-[#0F1923]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  All My Listings
                </h2>
                <Button size="sm" onClick={() => onNavigate("add-listing")}>
                  Add Listing
                </Button>
              </div>
              {listingLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading your listings...
                </div>
              ) : listingError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {listingError}
                </div>
              ) : sellerListings.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  You have not created any listings yet.
                </div>
              ) : (
                <Table
                  headers={[
                    "Credit Type",
                    "Qty (MT)",
                    "Price (₹/MT)",
                    "Location",
                    "Year",
                    "Valid Till",
                    "Listed On",
                    "Status",
                  ]}
                >
                  {sellerListings.map((listing) => (
                    <Tr key={listing._id}>
                      <Td>
                        <span className="font-medium">{listing.category}</span>
                      </Td>
                      <Td>{listing.quantity}</Td>
                      <Td>₹{listing.price}</Td>
                      <Td>{listing.location}</Td>
                      <Td>{listing.complianceYear}</Td>
                      <Td>
                        {listing.validTill
                          ? new Date(listing.validTill).toLocaleDateString(
                              "en-IN",
                            )
                          : "—"}
                      </Td>
                      <Td>
                        {listing.createdAt
                          ? new Date(listing.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "—"}
                      </Td>
                      <Td>
                        <Badge
                          label={
                            listing.status === "pending_review"
                              ? "Pending"
                              : listing.status
                          }
                        />
                      </Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          )}
          {active === "requests" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    Purchase Requests
                  </h2>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Buyer requests received for your listings.
                  </p>
                </div>

                <Badge label={`${purchaseRequests.length} Requests`} />
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
                    No purchase requests yet
                  </p>

                  <p className="text-sm mt-1">
                    Requests from buyers will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {purchaseRequests.map((request) => (
                    <div key={request._id} className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-4">
                            <h3
                              className="font-semibold text-[#0F1923]"
                              style={{
                                fontFamily: "Outfit, sans-serif",
                              }}
                            >
                              {request.listing?.category || "Credit Request"}
                            </h3>

                            <Badge label={request.status} />
                          </div>

                          <div className="mb-4">
                            <MessageChat
                              requestId={request._id}
                              role="seller"
                              compact
                              onRead={markRequestMessagesRead}
                            />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-[#9CA3AF]">Buyer</p>

                              <p className="font-medium text-[#374151]">
                                {request.buyer?.company ||
                                  request.buyerId?.company ||
                                  request.buyerId?.name ||
                                  "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Contact Person
                              </p>

                              <p className="font-medium text-[#374151]">
                                {request.contactPerson || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Requested Quantity
                              </p>

                              <p className="font-medium text-[#374151]">
                                {request.requestedQuantity} MT
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Your Listing
                              </p>

                              <p className="font-medium text-[#374151]">
                                {request.listing?.category || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Listed Price
                              </p>

                              <p className="font-medium text-[#374151]">
                                ₹{request.listing?.price ?? "—"} / MT
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#9CA3AF]">
                                Estimated Value
                              </p>

                              <p className="font-semibold text-[#5AC361]">
                                ₹
                                {(
                                  Number(request.requestedQuantity || 0) *
                                  Number(request.listing?.price || 0)
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 bg-[#F7F9FB] rounded-xl p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-xs text-[#9CA3AF]">
                                  Buyer
                                </span>
                                <p className="font-medium text-[#374151]">
                                  {request.buyer?.company || "Verified Buyer"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#9CA3AF]">
                                  Request ID
                                </span>
                                <p className="font-mono text-xs text-[#374151]">
                                  #{request._id?.slice(-6)}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#9CA3AF]">
                                  Submitted
                                </span>
                                <p className="font-medium text-[#374151]">
                                  {request.createdAt
                                    ? new Date(
                                        request.createdAt,
                                      ).toLocaleString("en-IN")
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#9CA3AF]">
                                  Status
                                </span>
                                <p className="font-medium text-[#374151] capitalize">
                                  {request.status}
                                </p>
                              </div>
                            </div>
                            {request.notes && (
                              <div className="mt-3 pt-3 border-t border-[#E5EAF0]">
                                <span className="text-xs text-[#9CA3AF]">
                                  Buyer Requirements
                                </span>
                                <p className="text-sm text-[#374151] mt-1">
                                  {request.notes}
                                </p>
                              </div>
                            )}
                            <div className="mt-4 p-3 bg-[#EBF8EC] rounded-lg">
                              <p className="text-xs text-[#2E7D32] leading-relaxed">
                                EPR Nexus manages buyer-seller communication and
                                communication. Direct buyer contact details are
                                kept confidential.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {active === "deals" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    My Deals
                  </h2>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Track transactions managed by EPR Nexus.
                  </p>
                </div>

                <Badge label={`${sellerDeals.length} Deals`} />
              </div>

              {dealLoading ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  Loading your deals...
                </div>
              ) : dealError ? (
                <div className="py-16 text-center text-[#EF4444]">
                  {dealError}
                </div>
              ) : sellerDeals.length === 0 ? (
                <div className="py-16 text-center text-[#9CA3AF]">
                  <p className="text-lg font-semibold text-[#374151]">
                    No deals yet
                  </p>

                  <p className="text-sm mt-1">
                    Managed transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {sellerDeals.map((deal) => {
                    const statusLabel =
                      {
                        matched: "Matched",
                        negotiating: "Negotiating",
                        terms_agreed: "Terms Agreed",
                        payment_coordination: "Payment Coordination",
                        completed: "Completed",
                        cancelled: "Cancelled",
                      }[deal.status] || deal.status;

                    const estimatedValue =
                      Number(deal.quantity || 0) *
                      Number(deal.agreedPrice || 0);

                    return (
                      <div key={deal._id} className="p-5">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                              <h3
                                className="font-semibold text-[#0F1923]"
                                style={{
                                  fontFamily: "Outfit, sans-serif",
                                }}
                              >
                                {deal.listing?.category || "EPR Credit Deal"}
                              </h3>

                              <Badge label={statusLabel} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Deal ID
                                </p>

                                <p className="font-mono text-xs text-[#374151]">
                                  #{deal._id.slice(-8)}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Quantity
                                </p>

                                <p className="font-medium text-[#374151]">
                                  {deal.quantity} MT
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Agreed Price
                                </p>

                                <p className="font-medium text-[#374151]">
                                  ₹{deal.agreedPrice} / MT
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Credit Value
                                </p>
                                <p className="font-semibold text-[#5AC361]">
                                  ₹
                                  {Number(
                                    deal.creditSubtotal ?? estimatedValue,
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  EPR Nexus Fee
                                </p>
                                <p className="font-medium text-[#374151]">
                                  ₹
                                  {Number(
                                    deal.serviceFee ??
                                      deal.commissionAmount ??
                                      0,
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Buyer Total
                                </p>
                                <p className="font-semibold text-[#0F1923]">
                                  ₹
                                  {Number(
                                    deal.finalAmount ??
                                      estimatedValue +
                                        Number(
                                          deal.serviceFee ??
                                            deal.commissionAmount ??
                                            0,
                                        ),
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Commission
                                </p>

                                <p className="font-medium text-[#374151]">
                                  ₹
                                  {Number(
                                    deal.commissionAmount || 0,
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              <div className="bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl p-3">
                                <p className="text-xs text-[#9CA3AF] mb-1">
                                  Payment
                                </p>

                                <p className="font-medium text-[#374151] capitalize">
                                  {deal.paymentStatus || "pending"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 p-4 bg-[#F7F9FB] border border-[#E5EAF0] rounded-xl">
                              <p className="text-xs font-semibold text-[#6B7280] mb-3 uppercase tracking-wide">
                                Deal Progress
                              </p>

                              <div className="flex items-center gap-1 overflow-x-auto">
                                {[
                                  { key: "matched", label: "Matched" },
                                  {
                                    key: "terms_agreed",
                                    label: "Quotation Accepted",
                                  },
                                  {
                                    key: "payment_coordination",
                                    label: "Payment Coordination",
                                  },
                                  { key: "completed", label: "Completed" },
                                ].map((stage, index, stages) => {
                                  const order = [
                                    "matched",
                                    "terms_agreed",
                                    "payment_coordination",
                                    "completed",
                                  ];

                                  const currentIndex = order.indexOf(
                                    deal.status,
                                  );

                                  const stageIndex = order.indexOf(stage.key);

                                  const done = currentIndex >= stageIndex;

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
                                          className={`w-3 h-0.5 ${
                                            done
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

                            <div className="mt-4 p-3 bg-[#EBF8EC] rounded-lg">
                              <p className="text-xs text-[#2E7D32] leading-relaxed">
                                EPR Nexus manages the transaction process and
                                keeps buyer contact information confidential.
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
                              <DealRoom deal={deal} role="seller" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-[#9CA3AF]">
                            Created{" "}
                            {deal.createdAt
                              ? new Date(deal.createdAt).toLocaleString("en-IN")
                              : "—"}
                          </div>

                          {deal.completedAt && (
                            <div className="text-xs font-medium text-[#2E7D32]">
                              Completed{" "}
                              {new Date(deal.completedAt).toLocaleString(
                                "en-IN",
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {active === "disputes" && <DisputesPage role="seller" />}

          {active === "messages" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]">
                <h2 className="font-semibold text-[#0F1923]">Messages</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Private communication with EPR Nexus. Quotations are handled
                  by EPR Nexus and are not part of Messages.
                </p>
              </div>
              {purchaseRequests.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#9CA3AF]">
                  No conversations yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E5EAF0]">
                  {purchaseRequests.map((request) => {
                    const unread = Number(
                      messageUnreadByRequest[String(request._id)] || 0,
                    );

                    return (
                      <div
                        key={request._id}
                        className={`p-5 flex items-center justify-between gap-4 border-l-4 ${
                          unread
                            ? "border-l-[#EF4444] bg-[#FEF2F2]"
                            : "border-l-transparent"
                        }`}
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
                            {request.requestedQuantity || request.quantity || 0}{" "}
                            MT ·{" "}
                            {unread
                              ? `${unread} unread message${
                                  unread === 1 ? "" : "s"
                                }`
                              : "No unread messages"}
                          </p>
                        </div>
                        <MessageChat
                          requestId={request._id}
                          role="seller"
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

          {active === "documents" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]">
                <h2 className="font-semibold text-[#0F1923]">Documents</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Manage the documents used for EPR Nexus verification.
                </p>
              </div>
              <div className="p-5">
                <div className="rounded-xl border border-[#E5EAF0] bg-[#F7F9FB] p-4">
                  <p className="text-sm font-semibold text-[#374151]">
                    Business verification
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Your verification documents are reviewed by EPR Nexus
                    administrators.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => onNavigate("verification")}
                  >
                    Open Verification
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {active === "profile" && (
            <Card>
              <div className="px-5 py-4 border-b border-[#E5EAF0]">
                <h2 className="font-semibold text-[#0F1923]">Profile</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Manage your seller account from the profile menu.
                </p>
              </div>
              <div className="p-5">
                <div className="rounded-xl border border-[#E5EAF0] bg-[#F7F9FB] p-4">
                  <p className="text-sm text-[#6B7280]">
                    Use the profile menu in the top navigation to view your
                    account details and verification status.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
export { SellerDashboard as default };
