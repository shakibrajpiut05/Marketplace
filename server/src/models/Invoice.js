import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 300 },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
      unique: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["issued", "paid", "void"],
      default: "issued",
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    issuedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true },
);

invoiceSchema.index({ buyerId: 1, issuedAt: -1 });
invoiceSchema.index({ sellerId: 1, issuedAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
