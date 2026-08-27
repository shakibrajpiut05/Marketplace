import { useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString();
};

export function NotificationBell({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications?limit=30");
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(Number(response.data.unreadCount || 0));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item._id === id ? { ...item, read: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-label="Notifications" onClick={() => { setOpen((value) => !value); if (!open) fetchNotifications(); }} className={`${compact ? "w-9 h-9" : "w-10 h-10"} rounded-full border border-[#E5EAF0] bg-white hover:bg-[#F7F9FB] flex items-center justify-center relative`}>
        <svg className="w-5 h-5 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17H9.143m8.571 0H6.286m11.428 0a2.286 2.286 0 002.286-2.286v-3.428a8 8 0 10-16 0v3.428A2.286 2.286 0 006.286 17m10.286 0a4.571 4.571 0 01-9.143 0" /></svg>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-[#E5EAF0] rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5EAF0] flex items-center justify-between"><div><p className="font-semibold text-[#0F1923]">Notifications</p><p className="text-[11px] text-[#9CA3AF]">Important account and marketplace updates</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-[#3EA646] hover:underline">Mark all read</button>}</div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading && !notifications.length ? <div className="px-5 py-10 text-center text-sm text-[#6B7280]">Loading notifications...</div> : !notifications.length ? <div className="px-5 py-10 text-center"><p className="text-sm font-medium text-[#374151]">No notifications</p><p className="text-xs text-[#9CA3AF] mt-1">You're all caught up.</p></div> : notifications.map((item) => (
              <button type="button" key={item._id} onClick={() => !item.read && markRead(item._id)} className={`w-full text-left px-4 py-3 border-b border-[#F0F4F8] hover:bg-[#F8FAFC] ${!item.read ? "bg-[#F0FBF1]" : "bg-white"}`}>
                <div className="flex gap-3"><div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.read ? "bg-[#CBD5E1]" : "bg-[#5AC361]"}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-[#0F1923]">{item.title}</p><span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{formatTime(item.createdAt)}</span></div><p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{item.message}</p></div></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminProfileMenu({ onNavigate, compact = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    onNavigate?.("home");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${compact ? "px-2" : "px-2.5"} py-1.5 rounded-lg hover:bg-[#F7F9FB] transition-colors flex items-center gap-2 max-w-52`}
      >
        <span className="w-7 h-7 rounded-full bg-[#EBF8EC] text-[#2E7D32] flex items-center justify-center text-xs font-bold">
          {(user?.name || "A").slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:block text-sm font-semibold text-[#374151] truncate">
          {user?.name || "Admin"}
        </span>
        <svg
          className="w-4 h-4 text-[#9CA3AF]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-white border border-[#E5EAF0] rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E5EAF0]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EBF8EC] text-[#2E7D32] flex items-center justify-center font-bold">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#0F1923] truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-[#6B7280]">Administrator account</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-[#D8E8DA] bg-[#F4FBF5] px-4 py-3">
              <p className="text-sm font-semibold text-[#2E7D32]">Platform Administrator</p>
              <p className="text-xs text-[#52715A] mt-1 leading-relaxed">
                This account is provisioned by EPR Nexus and does not require customer email, phone, or business verification.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                Email
              </p>
              <div className="mt-1 w-full rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#6B7280] break-all">
                {user?.email || "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] px-3 py-2">
                <p className="text-[#9CA3AF]">Access</p>
                <p className="font-semibold text-[#374151] mt-0.5">Full admin</p>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] px-3 py-2">
                <p className="text-[#9CA3AF]">Security</p>
                <p className="font-semibold text-[#374151] mt-0.5">Platform managed</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onNavigate?.("admin-dashboard");
              }}
              className="w-full py-2.5 bg-[#5AC361] text-white rounded-lg text-sm font-semibold hover:bg-[#3EA646]"
            >
              Open Admin Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 text-[#991B1B] bg-[#FEF2F2] rounded-lg text-sm font-semibold hover:bg-[#FEE2E2]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileMenu({ onNavigate, compact = false }) {
  const { user, refreshUser, updateProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => { setName(user?.name || ""); setPhone(user?.phone || ""); }, [user?.name, user?.phone]);
  useEffect(() => { const handleOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", handleOutside); return () => document.removeEventListener("mousedown", handleOutside); }, []);

  // Admin accounts use the dedicated admin profile menu.
  // Keep all hooks above this branch so React hook order never changes.
  if (user?.role === "admin") {
    return <AdminProfileMenu onNavigate={onNavigate} compact={compact} />;
  }

  const save = async () => {
    try { setSaving(true); setError(""); await updateProfile({ name: name.trim(), phone: phone.trim() }); setEditing(false); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to update profile."); }
    finally { setSaving(false); }
  };

  const status = user?.role === "admin"
    ? { label: "Admin account", tone: "green", detail: "Admin accounts are provisioned and verified by the platform." }
    : !user?.emailVerified
      ? { label: "Email verification pending", tone: "yellow", detail: "Verify your email before using marketplace services." }
      : user?.kycStatus === "approved"
        ? { label: "Profile verified", tone: "green", detail: "You can use all marketplace services." }
        : user?.kycStatus === "rejected"
          ? { label: "Verification rejected", tone: "red", detail: user?.kycRejectionReason || "Please re-upload your verification documents." }
          : user?.kycSubmittedAt
            ? { label: "Under verification", tone: "yellow", detail: "Your business verification is waiting for admin approval." }
            : { label: "Not verified", tone: "yellow", detail: "You cannot use marketplace trading services until your business is verified." };

  const toneClasses = { green: "bg-[#EBF8EC] border-[#A5D6A7] text-[#2E7D32]", yellow: "bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]", red: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]" };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => { setOpen((value) => !value); if (!open) refreshUser(); }} className={`${compact ? "px-2" : "px-2.5"} py-1.5 rounded-lg hover:bg-[#F7F9FB] transition-colors flex items-center gap-2 max-w-52`}>
        <span className="w-7 h-7 rounded-full bg-[#EBF8EC] text-[#2E7D32] flex items-center justify-center text-xs font-bold">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
        <span className="hidden sm:block text-sm font-semibold text-[#374151] truncate">{user?.name || "User"}</span>
        <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-white border border-[#E5EAF0] rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E5EAF0]"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-[#EBF8EC] text-[#2E7D32] flex items-center justify-center font-bold">{(user?.name || "U").slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="font-semibold text-[#0F1923] truncate">{user?.name || "User"}</p><p className="text-xs text-[#6B7280] capitalize">{user?.role || "user"} account</p></div></div></div>
          <div className="p-5 space-y-4">
            {error && <div className="text-xs text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2.5">{error}</div>}
            <div className="space-y-3">
              <label className="block"><span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Name</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={!editing} className="mt-1 w-full rounded-lg border border-[#E5EAF0] px-3 py-2 text-sm outline-none focus:border-[#5AC361] disabled:bg-[#F8FAFC]" /></label>
              <label className="block"><span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!editing} className="mt-1 w-full rounded-lg border border-[#E5EAF0] px-3 py-2 text-sm outline-none focus:border-[#5AC361] disabled:bg-[#F8FAFC]" /></label>
              <div><span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Email</span><div className="mt-1 w-full rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#6B7280] break-all">{user?.email || "—"}</div><p className="text-[10px] text-[#9CA3AF] mt-1">Email cannot be changed from your profile.</p></div>
            </div>
            <div className={`rounded-xl border px-3.5 py-3 ${toneClasses[status.tone]}`}><p className="text-sm font-semibold">{status.label}</p><p className="text-xs mt-1 leading-relaxed">{status.detail}</p>{user?.role !== "admin" && user?.kycStatus !== "approved" && <button type="button" onClick={() => { setOpen(false); onNavigate?.("verification"); }} className="mt-2 text-xs font-bold underline">{user?.kycStatus === "rejected" ? "Re-upload documents" : user?.kycSubmittedAt ? "View verification status" : "Upload documents to verify"}</button>}</div>
            {editing ? <div className="flex gap-2"><button type="button" onClick={() => { setEditing(false); setError(""); }} className="flex-1 py-2 border border-[#E5EAF0] rounded-lg text-sm">Cancel</button><button type="button" onClick={save} disabled={saving || !name.trim() || !phone.trim()} className="flex-1 py-2 bg-[#5AC361] text-white rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div> : <button type="button" onClick={() => setEditing(true)} className="w-full py-2 border border-[#E5EAF0] rounded-lg text-sm font-semibold text-[#374151] hover:bg-[#F7F9FB]">Edit profile</button>}
            <button type="button" onClick={() => { setOpen(false); onNavigate?.(`${user?.role}-dashboard`); }} className="w-full py-2 bg-[#5AC361] text-white rounded-lg text-sm font-semibold">Open Dashboard</button>
            <button type="button" onClick={() => { logout(); setOpen(false); onNavigate?.("home"); }} className="w-full py-2 text-[#991B1B] bg-[#FEF2F2] rounded-lg text-sm font-semibold">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
