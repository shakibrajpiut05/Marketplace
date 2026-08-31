import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { Badge, Button, Card, Textarea } from "./ui";
import { QuotationCard } from "./QuotationCenter.jsx";
import { DisputePanel } from "./DisputeCenter.jsx";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const STATUS_LABELS = {
  matched: "Matched",
  negotiating: "Negotiating",
  terms_agreed: "Terms agreed",
  payment_coordination: "Payment coordination",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS = {
  pending: "Payment pending",
  initiated: "Payment initiated",
  received: "Payment received",
  failed: "Payment failed",
};

const stages = [
  { key: "matched", label: "Matched" },
  { key: "terms_agreed", label: "Terms agreed" },
  { key: "payment_coordination", label: "Payment" },
  { key: "completed", label: "Completed" },
];

function Progress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FFF7F7] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B42318]">
          Deal cancelled
        </p>
        <p className="mt-1 text-sm text-[#667085]">
          This transaction is no longer active.
        </p>
      </div>
    );
  }

  const currentIndex = stages.findIndex((stage) => stage.key === status);

  return (
    <div className="rounded-xl border border-[#E5EAF0] bg-[#F7F9FB] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
        Deal progress
      </p>
      <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
        {stages.map((stage, index) => {
          const done = status === "completed" || currentIndex >= index;
          return (
            <div key={stage.key} className="flex shrink-0 items-center gap-1">
              <div
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap ${
                  done
                    ? "bg-[#5AC361] text-white"
                    : "bg-white text-[#98A2B3] border border-[#E5EAF0]"
                }`}
              >
                {stage.label}
              </div>
              {index < stages.length - 1 ? (
                <div
                  className={`h-0.5 w-5 ${
                    done && (status === "completed" || currentIndex > index)
                      ? "bg-[#5AC361]"
                      : "bg-[#DDE3EA]"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageThread({ dealId, role }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/deal-messages/deal/${dealId}`);
      setMessages(response.data?.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load deal messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dealId]);

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setError("");
      const response = await api.post(`/deal-messages/deal/${dealId}`, {
        message: trimmed,
      });
      if (response.data?.message) {
        setMessages((current) => [...current, response.data.message]);
        setMessage("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-[#E5EAF0]">
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F9FB] p-4">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-[#98A2B3]">
            Loading conversation…
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-[#344054]">
              Could not load messages
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#98A2B3]">{error}</p>
            <Button className="mt-4" size="sm" variant="outline" onClick={load}>
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium text-[#344054]">
                No deal messages yet
              </p>
              <p className="mt-1 text-xs text-[#98A2B3]">
                Use this thread to coordinate the transaction with EPR Nexus.
              </p>
            </div>
          </div>
        ) : (
          messages.map((item) => {
            const mine = item.senderRole === role;
            return (
              <div
                key={item._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "bg-[#5AC361] text-white"
                      : "border border-[#E5EAF0] bg-white text-[#344054]"
                  }`}
                >
                  <p className="text-[11px] font-semibold opacity-70">
                    {item.senderId?.company ||
                      item.senderId?.name ||
                      item.senderRole ||
                      "EPR Nexus"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[10px] opacity-60">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("en-IN")
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[#E5EAF0] bg-white p-4">
        {error ? <p className="mb-2 text-xs text-[#B42318]">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask EPR Nexus about payment, documents or transaction coordination…"
            className="min-h-[76px] flex-1"
            maxLength={2000}
          />
          <Button onClick={send} disabled={sending || !message.trim()}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-[#98A2B3]">
          Direct phone numbers, email addresses and external contact requests
          are blocked for transaction security.
        </p>
      </div>
    </div>
  );
}

function PaymentPanel({ deal, role, onDealUpdate }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/payments/deal/${deal._id}`);
      setPayment(response.data?.payment || null);
      setInvoice(response.data?.invoice || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load payment details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [deal?._id]);

  const initiate = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      setError("");
      const response = await api.post(`/payments/deal/${deal._id}/initiate`, {
        method,
        reference: reference.trim(),
        notes: notes.trim(),
      });
      setPayment(response.data?.payment || null);
      setInvoice(response.data?.invoice || null);
      onDealUpdate?.(response.data?.deal);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to initiate payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const printInvoice = () => {
    if (!invoice) return;
    const escapeHtml = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    const buyer = invoice.buyerId || {};
    const seller = invoice.sellerId || {};
    const itemRows = (invoice.items || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            <td>${escapeHtml(item.quantity)}</td>
            <td>₹${Number(item.unitPrice || 0).toLocaleString("en-IN")}</td>
            <td>₹${Number(item.amount || 0).toLocaleString("en-IN")}</td>
          </tr>`,
      )
      .join("");
    const win = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=900,height=700",
    );
    if (!win) return;
    win.document
      .write(`<!doctype html><html><head><title>${escapeHtml(invoice.invoiceNumber)}</title>
      <style>body{font-family:Arial,sans-serif;color:#101828;padding:40px}h1{margin:0 0 6px}.muted{color:#667085}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin:28px 0}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{border-bottom:1px solid #e5eaf0;padding:12px;text-align:left}th{font-size:12px;color:#667085;text-transform:uppercase}.totals{margin-left:auto;width:320px;margin-top:24px}.row{display:flex;justify-content:space-between;padding:7px 0}.total{font-size:18px;font-weight:700;border-top:2px solid #101828;margin-top:8px;padding-top:12px}</style>
      </head><body><h1>EPR Nexus</h1><div class="muted">Invoice ${escapeHtml(invoice.invoiceNumber)}</div>
      <div class="grid"><div><strong>Bill to</strong><p>${escapeHtml(buyer.company || buyer.name)}</p><p class="muted">${escapeHtml(buyer.email)}</p></div>
      <div><strong>Seller</strong><p>${escapeHtml(seller.company || seller.name)}</p><p class="muted">${escapeHtml(seller.email)}</p></div></div>
      <table><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
      <div class="totals"><div class="row"><span>Subtotal</span><strong>₹${Number(invoice.subtotal || 0).toLocaleString("en-IN")}</strong></div><div class="row"><span>EPR Nexus fee</span><strong>₹${Number(invoice.serviceFee || 0).toLocaleString("en-IN")}</strong></div><div class="row total"><span>Total</span><strong>₹${Number(invoice.total || 0).toLocaleString("en-IN")}</strong></div></div>
      <p class="muted">Issued ${new Date(invoice.issuedAt).toLocaleDateString("en-IN")} · Status ${escapeHtml(invoice.status)}</p>
      <script>window.onload=function(){window.print();}</script></body></html>`);
    win.document.close();
  };

  const status = payment?.status || deal.paymentStatus || "pending";
  const canInitiate =
    role === "buyer" &&
    ["pending", "failed"].includes(status) &&
    !["completed", "cancelled"].includes(deal.status);

  if (loading) {
    return (
      <Card>
        <div className="py-16 text-center text-sm text-[#98A2B3]">
          Loading payment details…
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <Card className="border-[#FECACA] bg-[#FFF7F7]">
          <p className="text-sm font-medium text-[#991B1B]">{error}</p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={loadPayment}
          >
            Retry
          </Button>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
              Payment
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold text-[#0F1923]">
              {money(deal.finalAmount ?? deal.commercialTerms?.finalAmount)}
            </h3>
            <p className="mt-1 text-sm text-[#667085]">
              Amount due for the locked commercial terms.
            </p>
          </div>
          <Badge label={PAYMENT_LABELS[status] || status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric
            label="Amount"
            value={money(payment?.amount ?? deal.finalAmount)}
          />
          <Metric
            label="Method"
            value={(payment?.method || "—").replaceAll("_", " ")}
          />
          <Metric
            label="Reference"
            value={payment?.reference || "Not provided"}
          />
        </div>
      </Card>

      {canInitiate ? (
        <Card>
          <p className="text-sm font-semibold text-[#101828]">
            Initiate payment
          </p>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            This records your payment attempt. It does not mark the payment as
            received; EPR Nexus confirms receipt separately.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#344054]">
              Payment method
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1.5 min-h-10 w-full rounded-lg border border-[#DCE3EA] bg-white px-3 py-2 text-sm font-normal text-[#101828] outline-none focus:border-[#5AC361] focus:ring-4 focus:ring-[#5AC361]/10"
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#344054]">
              Transaction reference
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={160}
                placeholder="UTR / transaction ID"
                className="mt-1.5 min-h-10 w-full rounded-lg border border-[#DCE3EA] bg-white px-3 py-2 text-sm font-normal text-[#101828] outline-none focus:border-[#5AC361] focus:ring-4 focus:ring-[#5AC361]/10"
              />
            </label>
          </div>
          <Textarea
            label="Payment note (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            className="mt-4"
            placeholder="Add any payment coordination note…"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={initiate} disabled={actionLoading}>
              {actionLoading
                ? "Initiating…"
                : status === "failed"
                  ? "Retry payment"
                  : "Initiate payment"}
            </Button>
          </div>
        </Card>
      ) : null}

      {status === "initiated" ? (
        <Card className="border-[#FED7AA] bg-[#FFFAF5]">
          <p className="text-sm font-semibold text-[#92400E]">
            Payment is awaiting confirmation
          </p>
          <p className="mt-1 text-sm leading-6 text-[#7C5A2E]">
            Keep your transaction reference available. EPR Nexus will confirm
            the payment after verification.
          </p>
        </Card>
      ) : null}

      {invoice ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                Invoice
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#0F1923]">
                {invoice.invoiceNumber}
              </h3>
              <p className="mt-1 text-sm text-[#667085]">
                Issued {new Date(invoice.issuedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge label={invoice.status === "paid" ? "Paid" : "Issued"} />
              <Button size="sm" variant="outline" onClick={printInvoice}>
                Print / Save PDF
              </Button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5EAF0] text-left text-xs uppercase tracking-wide text-[#98A2B3]">
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Qty</th>
                  <th className="px-3 py-3">Unit price</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, index) => (
                  <tr
                    key={`${item.description}-${index}`}
                    className="border-b border-[#F0F2F5]"
                  >
                    <td className="px-3 py-3 text-[#344054]">
                      {item.description}
                    </td>
                    <td className="px-3 py-3 text-[#667085]">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-[#667085]">
                      {money(item.unitPrice)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-[#344054]">
                      {money(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#667085]">Subtotal</span>
              <strong>{money(invoice.subtotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">EPR Nexus fee</span>
              <strong>{money(invoice.serviceFee)}</strong>
            </div>
            <div className="flex justify-between border-t border-[#E5EAF0] pt-3 text-base">
              <span className="font-semibold">Total</span>
              <strong>{money(invoice.total)}</strong>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm font-semibold text-[#344054]">
            Invoice not generated yet
          </p>
          <p className="mt-1 text-sm text-[#667085]">
            An invoice is generated when payment coordination is initiated.
          </p>
        </Card>
      )}
    </div>
  );
}

export function DealRoom({ deal, role = "buyer" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [request, setRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [dealState, setDealState] = useState(deal);
  const currentDeal = dealState || deal;

  const loadRequest = async () => {
    if (!currentDeal?.requestId) return;
    try {
      setRequestLoading(true);
      setRequestError("");
      const endpoint =
        role === "seller" ? "/requests/seller" : "/requests/buyer";
      const response = await api.get(endpoint);
      const requests = response.data?.requests || [];
      const found = requests.find(
        (item) => String(item._id) === String(currentDeal.requestId),
      );
      setRequest(found || null);
      if (!found)
        setRequestError("The original purchase request could not be loaded.");
    } catch (err) {
      setRequestError(
        err.response?.data?.message || "Unable to load the purchase request.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    if (open && tab === "quotation") loadRequest();
  }, [open, tab, currentDeal?.requestId, role]);

  const title = currentDeal?.listing?.category || "EPR Credit Deal";
  const total = Number(
    currentDeal?.finalAmount ??
      currentDeal?.commercialTerms?.finalAmount ??
      currentDeal?.creditSubtotal ??
      0,
  );
  const counterpart =
    role === "buyer"
      ? currentDeal?.seller?.company ||
        currentDeal?.seller?.name ||
        "Verified Seller"
      : currentDeal?.buyer?.company ||
        currentDeal?.buyer?.name ||
        "Verified Buyer";

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "messages", label: "Messages" },
      { id: "quotation", label: "Quotation" },
      { id: "payment", label: "Payment & Invoice" },
      { id: "dispute", label: "Dispute" },
    ],
    [],
  );

  if (!currentDeal) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Open Deal Room
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 sm:p-5">
          <div className="flex h-[min(820px,94vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="shrink-0 border-b border-[#E5EAF0] px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading truncate text-lg font-semibold text-[#0F1923]">
                      {title}
                    </p>
                    <Badge
                      label={
                        STATUS_LABELS[currentDeal.status] ||
                        currentDeal.status ||
                        "Deal"
                      }
                    />
                    <Badge
                      label={
                        PAYMENT_LABELS[currentDeal.paymentStatus] ||
                        "Payment pending"
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#667085]">
                    Deal #{String(currentDeal._id).slice(-8)} ·{" "}
                    {currentDeal.quantity || 0} MT · {counterpart}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label="Close deal room"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 flex gap-1 overflow-x-auto">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
                      tab === item.id
                        ? "bg-[#F0FBF1] text-[#2E7D32]"
                        : "text-[#667085] hover:bg-[#F7F9FB]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#FBFCFD] p-4 sm:p-6">
              {tab === "overview" ? (
                <div className="space-y-5">
                  <Progress status={currentDeal.status} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                            Commercial terms
                          </p>
                          <p className="mt-1 text-sm text-[#667085]">
                            The accepted transaction snapshot.
                          </p>
                        </div>
                        {currentDeal.commercialTermsLocked ? (
                          <Badge label="Locked" />
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Metric
                          label="Quantity"
                          value={`${currentDeal.quantity || 0} MT`}
                        />
                        <Metric
                          label="Price / MT"
                          value={money(currentDeal.agreedPrice)}
                        />
                        <Metric
                          label="Credit value"
                          value={money(currentDeal.creditSubtotal)}
                        />
                        <Metric
                          label="EPR Nexus fee"
                          value={money(
                            currentDeal.serviceFee ??
                              currentDeal.commissionAmount,
                          )}
                        />
                        <Metric label="Buyer total" value={money(total)} />
                        <Metric
                          label="Payment"
                          value={
                            PAYMENT_LABELS[currentDeal.paymentStatus] ||
                            currentDeal.paymentStatus ||
                            "Pending"
                          }
                        />
                      </div>
                    </Card>

                    <Card>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                        Credit
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#0F1923]">
                        {title}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Metric
                          label="Location"
                          value={currentDeal.listing?.location || "—"}
                        />
                        <Metric
                          label="Compliance year"
                          value={
                            currentDeal.listing?.complianceYear
                              ? `FY ${deal.listing.complianceYear}`
                              : "—"
                          }
                        />
                        <Metric
                          label="Valid till"
                          value={
                            currentDeal.listing?.validTill
                              ? new Date(
                                  deal.listing.validTill,
                                ).toLocaleDateString("en-IN")
                              : "—"
                          }
                        />
                        <Metric
                          label={role === "buyer" ? "Seller" : "Buyer"}
                          value={counterpart}
                        />
                      </div>
                    </Card>
                  </div>

                  <Card className="border-[#CFE8D1] bg-[#F5FBF6]">
                    <p className="text-sm font-semibold text-[#1F6B2A]">
                      Transaction coordination
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#52705A]">
                      EPR Nexus coordinates the transaction and keeps
                      participant contact information private. Use the Messages
                      tab for payment, document and delivery coordination.
                    </p>
                  </Card>

                  {currentDeal.notes ? (
                    <Card>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                        Deal notes
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#475467]">
                        {currentDeal.notes}
                      </p>
                    </Card>
                  ) : null}
                </div>
              ) : tab === "messages" ? (
                <MessageThread dealId={currentDeal._id} role={role} />
              ) : tab === "payment" ? (
                <PaymentPanel
                  deal={currentDeal}
                  role={role}
                  onDealUpdate={(updated) => updated && setDealState(updated)}
                />
              ) : tab === "dispute" ? (
                <DisputePanel deal={currentDeal} role={role} />
              ) : (
                <div className="mx-auto max-w-2xl">
                  {requestLoading ? (
                    <Card>
                      <div className="py-16 text-center text-sm text-[#98A2B3]">
                        Loading quotation…
                      </div>
                    </Card>
                  ) : requestError ? (
                    <Card>
                      <div className="py-12 text-center">
                        <p className="text-sm font-medium text-[#344054]">
                          Quotation unavailable
                        </p>
                        <p className="mt-1 text-xs text-[#98A2B3]">
                          {requestError}
                        </p>
                        <Button
                          className="mt-4"
                          size="sm"
                          variant="outline"
                          onClick={loadRequest}
                        >
                          Retry
                        </Button>
                      </div>
                    </Card>
                  ) : request?.offer ? (
                    <div>
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                          Accepted commercial offer
                        </p>
                        <h3 className="mt-1 font-heading text-xl font-semibold text-[#0F1923]">
                          Quotation #{request.offer.version}
                        </h3>
                      </div>
                      <QuotationCard request={request} showActions={false} />
                      <p className="mt-3 text-center text-xs text-[#98A2B3]">
                        This view is read-only because the deal already
                        represents the transaction state.
                      </p>
                    </div>
                  ) : (
                    <Card>
                      <div className="py-12 text-center">
                        <p className="text-sm font-medium text-[#344054]">
                          No quotation attached
                        </p>
                        <p className="mt-1 text-xs text-[#98A2B3]">
                          EPR Nexus has not attached a quotation to this deal
                          request.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
      <p className="text-[11px] text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#344054]">{value}</p>
    </div>
  );
}
