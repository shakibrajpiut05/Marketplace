import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { Badge, Button, Card, Input, Textarea } from "./ui";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const statusLabel = (status) => {
  const labels = {
    pending: "New request",
    reviewing: "Under review",
    matched: "Ready for quotation",
    negotiating: "Commercial discussion",
    offer_sent: "Quotation sent",
    offer_accepted: "Accepted",
    approved: "Deal confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };
  return labels[status] || status || "—";
};

const isLocked = (status) => ["approved", "completed", "cancelled"].includes(status);

function MessageList({ messages, role }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FB] min-h-0">
      {messages.length === 0 ? (
        <div className="h-full min-h-[240px] flex items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium text-[#374151]">No messages yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Messages are private between you and EPR Nexus.
            </p>
          </div>
        </div>
      ) : (
        messages.map((item) => {
          const mine = item.senderRole === role;
          return (
            <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                  mine
                    ? "bg-[#5AC361] text-white"
                    : "bg-white border border-[#E5EAF0] text-[#374151]"
                }`}
              >
                <p className="text-[11px] font-semibold opacity-70 mb-1">{item.senderLabel}</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.message}</p>
                <p className="text-[10px] opacity-60 mt-2">
                  {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export function QuotationCard({ request, onAccept, accepting, showActions = true }) {
  const offer = request?.offer;
  if (!offer || offer.finalAmount == null) return null;

  const accepted = Boolean(offer.acceptedAt);
  const expired = offer.expiresAt && new Date(offer.expiresAt).getTime() < Date.now();

  return (
    <div className={`rounded-xl border p-4 ${accepted ? "border-[#B7DFC0] bg-[#F0FBF1]" : "border-[#CFE8D1] bg-[#F8FCF8]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-[#6B7280]">EPR Nexus Quotation #{offer.version}</p>
          <p className="text-lg font-bold text-[#0F1923] mt-1">{money(offer.finalAmount)}</p>
        </div>
        <span className="text-xs font-semibold text-[#2E7D32]">
          {accepted ? "Accepted" : expired ? "Expired" : "Awaiting response"}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-[#6B7280]">Credit value</span><b>{money(offer.creditSubtotal)}</b></div>
        <div className="flex justify-between"><span className="text-[#6B7280]">EPR Nexus service fee</span><b>{money(offer.serviceFee)}</b></div>
        <div className="border-t border-[#DDEADF] pt-2 flex justify-between font-bold"><span>Buyer pays</span><span>{money(offer.finalAmount)}</span></div>
      </div>
      {offer.note ? <div className="mt-3 rounded-lg bg-white border border-[#E5EAF0] p-3 text-xs text-[#52606D]">{offer.note}</div> : null}
      {showActions && !accepted && !expired ? (
        <Button className="w-full mt-4" onClick={onAccept} disabled={accepting}>
          {accepting ? "Confirming..." : "Accept Quotation"}
        </Button>
      ) : null}
      {accepted ? <p className="mt-4 text-xs text-[#2E7D32]">Commercial terms are locked. Payment is still pending until EPR Nexus confirms receipt.</p> : null}
    </div>
  );
}

export default function QuotationCenter({ initialRequestId = "" }) {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(initialRequestId);
  const [loading, setLoading] = useState(true);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offer, setOffer] = useState({ creditPricePerUnit: "", serviceFee: "", note: "", expiresAt: "" });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/admin/negotiations");
      if (response.data.success) {
        const incoming = response.data.requests || [];
        setRequests(incoming);
        if (!selectedId || !incoming.some((item) => item._id === selectedId)) setSelectedId(incoming[0]?._id || "");
      }
    } catch (error) {
      console.error("Admin quotations failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const selected = useMemo(() => requests.find((item) => item._id === selectedId) || null, [requests, selectedId]);

  useEffect(() => {
    const current = selected?.offer;
    setOffer({
      creditPricePerUnit: current?.creditPricePerUnit ?? "",
      serviceFee: current?.serviceFee ?? "",
      note: "",
      expiresAt: current?.expiresAt ? new Date(current.expiresAt).toISOString().slice(0, 16) : "",
    });
  }, [selectedId, selected?.offer?.version]);

  const total = Number(offer.creditPricePerUnit || 0) * Number(selected?.quantity || 0) + Number(offer.serviceFee || 0);

  const saveOffer = async () => {
    if (!selectedId) return;
    if (offer.creditPricePerUnit === "" || offer.serviceFee === "") {
      alert("Enter both the credit price and EPR Nexus service fee.");
      return;
    }
    try {
      setSavingOffer(true);
      const response = await api.patch(`/requests/admin/${selectedId}/offer`, {
        creditPricePerUnit: Number(offer.creditPricePerUnit),
        serviceFee: Number(offer.serviceFee),
        note: offer.note,
        expiresAt: offer.expiresAt || null,
      });
      if (response.data.success) {
        await loadRequests();
        setOffer((current) => ({ ...current, note: "" }));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send the quotation.");
    } finally {
      setSavingOffer(false);
    }
  };

  return (
    <div className="h-[calc(100vh-170px)] min-h-[600px] grid xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
      <Card className="overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-4 border-b border-[#E5EAF0]"><h2 className="font-semibold text-[#0F1923]">Quotations</h2><p className="text-xs text-[#9CA3AF] mt-1">Create and revise EPR Nexus commercial offers. Messaging is handled separately.</p></div>
        <div className="overflow-y-auto min-h-0">
          {loading ? <p className="p-6 text-sm text-[#9CA3AF]">Loading quotation requests...</p> : requests.length === 0 ? <p className="p-6 text-sm text-[#9CA3AF]">No quotation requests yet.</p> : requests.map((request) => (
            <button type="button" key={request._id} onClick={() => setSelectedId(request._id)} className={`w-full text-left p-4 border-b border-[#F0F4F8] ${selectedId === request._id ? "bg-[#F0FBF1]" : "hover:bg-[#F8FAFC]"}`}>
              <div className="flex justify-between gap-2"><p className="font-semibold text-sm text-[#0F1923]">{request.listingId?.category || "EPR Credit"}</p><Badge label={request.offer?.finalAmount != null ? `#${request.offer.version}` : "Pending"} /></div>
              <p className="text-xs text-[#6B7280] mt-1">{request.quantity} MT · {request.buyerId?.company || request.buyerId?.name || "Buyer"}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-2">{request.offer?.finalAmount != null ? money(request.offer.finalAmount) : "Quotation not issued"}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden min-h-0">
        {!selected ? <div className="h-full flex items-center justify-center p-12 text-center text-[#9CA3AF]">Select a request to create or review a quotation.</div> : (
          <div className="h-full overflow-y-auto p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#E5EAF0]">
              <div><h2 className="font-semibold text-[#0F1923]">{selected.listingId?.category || "Credit"} · {selected.quantity} MT</h2><p className="text-xs text-[#6B7280] mt-1">Buyer: {selected.buyerId?.company || selected.buyerId?.name || "—"}</p></div>
              <Badge label={statusLabel(selected.status)} />
            </div>
            <div className="grid lg:grid-cols-[1fr_360px] gap-5 mt-5">
              <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-5">
                <h3 className="font-semibold text-[#0F1923]">Quotation history</h3>
                {selected.offerHistory?.length ? <div className="mt-4 space-y-3">{selected.offerHistory.map((item) => <div key={item.version} className="rounded-lg border border-[#E5EAF0] bg-white p-3"><div className="flex justify-between"><span className="text-xs font-semibold">Quotation #{item.version}</span><span className="text-xs text-[#6B7280]">{money(item.finalAmount)}</span></div><p className="text-xs text-[#6B7280] mt-1">{item.sentAt ? new Date(item.sentAt).toLocaleString("en-IN") : "—"}{item.acceptedAt ? " · Accepted" : ""}</p></div>)}</div> : <p className="text-sm text-[#9CA3AF] mt-3">No previous quotations.</p>}
                {selected.offer?.finalAmount != null ? <div className="mt-4"><QuotationCard request={selected} showActions={false} /></div> : null}
              </div>
              <div className="rounded-xl border border-[#E5EAF0] p-5">
                {selected.offer?.acceptedAt ? (
                  <div>
                    <h3 className="font-semibold text-[#0F1923]">Quotation accepted</h3>
                    <p className="text-sm text-[#6B7280] mt-2">Commercial terms are locked. Do not issue another quotation for this request. Continue the transaction from Deals / Transactions and confirm payment there.</p>
                    <div className="mt-4 rounded-lg bg-[#F0FBF1] border border-[#CFE8D1] p-3 text-sm text-[#2E7D32]">Payment status is managed separately from quotation acceptance.</div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-[#0F1923]">{selected.offer?.finalAmount != null ? "Send revised quotation" : "Create quotation"}</h3>
                    <div className="mt-4 space-y-3">
                  <Input label="Credit Price / MT" type="number" min="0" value={offer.creditPricePerUnit} onChange={(e) => setOffer((v) => ({ ...v, creditPricePerUnit: e.target.value }))} />
                  <Input label="EPR Nexus Service Fee" type="number" min="0" value={offer.serviceFee} onChange={(e) => setOffer((v) => ({ ...v, serviceFee: e.target.value }))} />
                  <Input label="Expires At" type="datetime-local" value={offer.expiresAt} onChange={(e) => setOffer((v) => ({ ...v, expiresAt: e.target.value }))} />
                  <Textarea label="Note to Buyer" value={offer.note} onChange={(e) => setOffer((v) => ({ ...v, note: e.target.value }))} placeholder="Optional commercial note..." />
                  <div className="rounded-lg bg-[#F0FBF1] border border-[#CFE8D1] p-3 flex justify-between"><span className="text-sm text-[#52715A]">Buyer pays</span><strong>{money(total)}</strong></div>
                      <Button className="w-full" onClick={saveOffer} disabled={savingOffer}>{savingOffer ? "Sending..." : selected.offer?.finalAmount != null ? "Send Revised Quotation" : "Send Quotation"}</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
