import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    lpoNumber: String,

    jobCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    items: [
      {
        partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
        name: String,
        qty: Number,
        price: Number,
        total: Number,
      },
    ],

    laborCost: {
      type: Number,
      default: 0,
    },

    subtotal: Number,

    gstPercent: {
      type: Number,
      default: 18,
    },

    gstAmount: Number,

    discount: {
      type: Number,
      default: 0,
    },

    grandTotal: Number,

    paidAmount: {
      type: Number,
      default: 0,
    },

    balanceAmount: Number,

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
