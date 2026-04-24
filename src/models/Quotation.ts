import mongoose from "mongoose";

const QuotationSchema = new mongoose.Schema(
  {
    quotationNumber: String,
    lpoNumber: String,

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    jobCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      default: null,
    },

    isSubQuotation: {
      type: Boolean,
      default: false,
    },

    items: [
      {
        partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
        name: String,
        qty: Number,
        price: Number,
      },
    ],

    laborCost: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "approved", "rejected", "converted", "billed_inspection", "closed"],
      default: "draft",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", QuotationSchema);
