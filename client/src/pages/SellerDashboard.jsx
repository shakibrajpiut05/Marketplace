import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { NotificationBell, ProfileMenu } from "../components/AccountTools.jsx";
import { Badge, Button, Card, StatCard, Table, Tr, Td } from "../components/ui";
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

  const activeCount = useMemo(
    () =>
      sellerListings.filter((listing) => listing.status === "active").length,
    [sellerListings],
  );

  const totalQty = useMemo(
    () =>
      sellerListings.reduce(
        (sum, listing) => sum + Number(listing.quantity || 0),
        0,
      ),
    [sellerListings],
  );

  const rejectedListings = useMemo(
    () => sellerListings.filter((listing) => listing.status === "rejected"),
    [sellerListings],
  );
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
              R
            </div>
            <div>
              <p className="text-xs font-semibold text-[#374151]">
                Rajesh Industries
              </p>
              <p className="text-[10px] text-[#9CA3AF]">Seller #248</p>
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
              {n.icon}
              {n.label}
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
            Logout
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
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell compact />
            <ProfileMenu onNavigate={onNavigate} compact />
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
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Listings"
                  value={sellerListings.length}
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
                  label="Active Listings"
                  value={activeCount}
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
                  label="Total Quantity (MT)"
                  value={totalQty.toLocaleString()}
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Deals in Progress"
                  value={
                    purchaseRequests.filter(
                      (request) =>
                        request.status === "negotiating" ||
                        request.status === "matched" ||
                        request.status === "reviewing",
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Rejected alert */}
              {rejectedListings.length > 0 && (
                <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#991B1B]">
                      {rejectedListings.length} listing
                      {rejectedListings.length > 1 ? "s" : ""} rejected by admin
                    </p>
                    <p className="text-xs text-[#EF4444] mt-0.5">
                      {rejectedListings[0]?.rejectionReason ||
                        "Please review the rejection reason and resubmit."}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onNavigate("add-listing")}
                  >
                    Resubmit
                  </Button>
                </div>
              )}

              <Card>
                <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
                  <h2
                    className="font-semibold text-[#0F1923]"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    My Recent Listings
                  </h2>
                  <button
                    className="text-sm text-[#5AC361] font-medium hover:underline"
                    onClick={() => setActive("listings")}
                  >
                    View All →
                  </button>
                </div>
                {listingLoading ? (
                  <div className="py-10 text-center text-[#9CA3AF]">
                    Loading your listings...
                  </div>
                ) : listingError ? (
                  <div className="py-10 text-center text-[#EF4444]">
                    {listingError}
                  </div>
                ) : sellerListings.length === 0 ? (
                  <div className="py-10 text-center text-[#9CA3AF]">
                    You have not created any listings yet.
                  </div>
                ) : (
                  <Table
                    headers={[
                      "Credit Type",
                      "Quantity (MT)",
                      "Price (₹/MT)",
                      "Comp. Year",
                      "Status",
                      "Action",
                    ]}
                  >
                    {sellerListings.slice(0, 5).map((listing) => (
                      <Tr key={listing._id}>
                        <Td>
                          <span className="font-medium">
                            {listing.category}
                          </span>
                        </Td>
                        <Td>{listing.quantity}</Td>
                        <Td>₹{listing.price}</Td>
                        <Td>{listing.complianceYear}</Td>
                        <Td>
                          <Badge
                            label={
                              listing.status === "pending_review"
                                ? "Pending"
                                : listing.status
                            }
                          />
                        </Td>
                        <Td>
                          {listing.status === "rejected" ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onNavigate("add-listing")}
                            >
                              Resubmit
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActive("listings")}
                            >
                              View
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Table>
                )}
              </Card>
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
                                negotiation. Direct buyer contact details are
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
                                  Transaction Value
                                </p>

                                <p className="font-semibold text-[#5AC361]">
                                  ₹{estimatedValue.toLocaleString("en-IN")}
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
                                  {
                                    key: "matched",
                                    label: "Matched",
                                  },
                                  {
                                    key: "negotiating",
                                    label: "Negotiating",
                                  },
                                  {
                                    key: "terms_agreed",
                                    label: "Terms Agreed",
                                  },
                                  {
                                    key: "payment_coordination",
                                    label: "Payment Coordination",
                                  },
                                  {
                                    key: "completed",
                                    label: "Completed",
                                  },
                                ].map((stage, index, stages) => {
                                  const order = [
                                    "matched",
                                    "negotiating",
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

          {(active === "messages" ||
            active === "documents" ||
            active === "profile") && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F0F4F8] flex items-center justify-center text-[#9CA3AF] mb-3">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p
                className="font-semibold text-[#374151]"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {NAV.find((n) => n.id === active)?.label}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                This section will appear when you have activity.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export { SellerDashboard as default };
