import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import CreditDetailPage from "./pages/CreditDetailPage";
import AuthPage from "./pages/AuthPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import SignupEmailPendingPage from "./pages/SignupEmailPendingPage";
import GoogleSignupPhonePage from "./pages/GoogleSignupPhonePage";
import VerificationPage from "./pages/VerificationPage";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddListingPage from "./pages/AddListingPage";
import { NotificationBell, ProfileMenu } from "./components/AccountTools.jsx";

const DASHBOARD_PAGES = [
  "seller-dashboard",
  "buyer-dashboard",
  "admin-dashboard",
  "add-listing",
  "verification",
  "email-pending",
  "google-signup-phone",
  "email-verification",
];

function Navbar({ page, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (DASHBOARD_PAGES.includes(page)) return null;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    onNavigate("home");
  };

  const publicLinks = [
    { label: "Marketplace", page: "marketplace" },
    { label: "How It Works", page: "home" },
    { label: "About Us", page: "home" },
  ];

  const authenticatedLinks = [
    { label: "Marketplace", page: "marketplace" },
    ...(user?.role === "buyer"
      ? [{ label: "Post Requirement", page: "buyer-dashboard" }]
      : []),
    { label: "How It Works", page: "home" },
    { label: "About Us", page: "home" },
  ];

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <nav className="bg-white border-b border-[#E5EAF0] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 flex-shrink-0"
        >
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
          <div className="hidden sm:block">
            <p
              className="text-sm font-bold text-[#0F1923] leading-none"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              EPR Nexus
            </p>
            <p className="text-[10px] text-[#9CA3AF] leading-none mt-0.5">
              Connecting Value. Ensuring Compliance.
            </p>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              type="button"
              key={link.label}
              onClick={() => onNavigate(link.page)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-[#F7F9FB] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell compact />
              <ProfileMenu onNavigate={onNavigate} />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate("auth")}
                className="px-4 py-1.5 text-sm font-medium text-[#374151] hover:text-[#0F1923]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => onNavigate("auth")}
                className="px-4 py-1.5 bg-[#5AC361] hover:bg-[#3EA646] text-white text-sm font-medium rounded-lg"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-[#F0F4F8] text-[#6B7280]"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#E5EAF0] bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <button
              type="button"
              key={link.label}
              onClick={() => {
                onNavigate(link.page);
                setMenuOpen(false);
              }}
              className="px-3 py-2.5 text-sm text-[#374151] hover:bg-[#F7F9FB] rounded-lg text-left font-medium"
            >
              {link.label}
            </button>
          ))}

          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onNavigate(`${user?.role}-dashboard`);
                  setMenuOpen(false);
                }}
                className="px-3 py-2.5 text-sm text-[#374151] hover:bg-[#F7F9FB] rounded-lg text-left font-medium"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2.5 text-sm text-[#991B1B] bg-[#FEF2F2] rounded-lg text-left font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#E5EAF0]">
              <button
                type="button"
                onClick={() => {
                  onNavigate("auth");
                  setMenuOpen(false);
                }}
                className="flex-1 py-2 border border-[#E5EAF0] text-sm text-[#374151] rounded-lg"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate("auth");
                  setMenuOpen(false);
                }}
                className="flex-1 py-2 bg-[#5AC361] text-white text-sm rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("home");
  const [creditId, setCreditId] = useState(1);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify-email");

    if (token) {
      setEmailVerificationToken(token);
      setPage("email-verification");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (page === "auth" && user) {
      setPage("home");
    }
  }, [loading, user, page]);

  const navigate = (nextPage, id) => {
    if (nextPage === "credit-detail" && id) {
      setCreditId(id);
    }

    if (nextPage === "seller-dashboard" && user?.role !== "seller") {
      nextPage = user ? `${user.role}-dashboard` : "auth";
    }

    if (nextPage === "buyer-dashboard" && user?.role !== "buyer") {
      nextPage = user ? `${user.role}-dashboard` : "auth";
    }

    if (nextPage === "admin-dashboard" && user?.role !== "admin") {
      nextPage = user ? `${user.role}-dashboard` : "auth";
    }

    if (nextPage === "add-listing" && (!user || user.role !== "seller")) {
      nextPage = user ? "verification" : "auth";
    }

    if (
      nextPage === "verification" &&
      (!user || !["buyer", "seller"].includes(user.role))
    ) {
      nextPage = user ? `${user.role}-dashboard` : "auth";
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CBD5E1] border-t-[#5AC361] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navbar page={page} onNavigate={navigate} />

      {page === "home" && <HomePage onNavigate={navigate} />}
      {page === "marketplace" && <MarketplacePage onNavigate={navigate} />}
      {page === "credit-detail" && (
        <CreditDetailPage creditId={creditId} onNavigate={navigate} />
      )}
      {page === "auth" && <AuthPage onNavigate={navigate} />}
      {page === "email-pending" && (
        <SignupEmailPendingPage onNavigate={navigate} />
      )}
      {page === "google-signup-phone" && (
        <GoogleSignupPhonePage onNavigate={navigate} />
      )}
      {page === "email-verification" && (
        <EmailVerificationPage
          token={emailVerificationToken}
          onNavigate={navigate}
        />
      )}
      {page === "verification" && <VerificationPage onNavigate={navigate} />}
      {page === "seller-dashboard" && <SellerDashboard onNavigate={navigate} />}
      {page === "buyer-dashboard" && <BuyerDashboard onNavigate={navigate} />}
      {page === "admin-dashboard" && <AdminDashboard onNavigate={navigate} />}
      {page === "add-listing" && <AddListingPage onNavigate={navigate} />}

      {!DASHBOARD_PAGES.includes(page) && (
        <footer className="bg-[#0F1923] text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#5AC361] flex items-center justify-center">
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
                  <span
                    className="font-bold text-sm"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    EPR Nexus
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  India&apos;s trusted B2B EPR credit marketplace. Connecting
                  verified sellers and buyers through secure, mediated
                  transactions.
                </p>
              </div>
              {[
                {
                  title: "Platform",
                  links: [
                    "Browse Credits",
                    "Post Requirement",
                    "How It Works",
                    "Pricing",
                  ],
                },
                {
                  title: "Company",
                  links: ["About Us", "Our Team", "Contact", "Careers"],
                },
                {
                  title: "Legal",
                  links: [
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "Compliance",
                  ],
                },
              ].map((column) => (
                <div key={column.title}>
                  <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wider">
                    {column.title}
                  </p>
                  <ul className="space-y-1.5">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-white/30">
                © 2025 EPR Nexus. All rights reserved.
              </p>
              <p className="text-xs text-white/30">
                Made in India 🇮🇳 · CPCB Compliant Platform
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export { App as default };
