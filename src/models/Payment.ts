import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    amount: Number,

    method: {
      type: String,
      enum: ["cash", "upi", "card", "bank"],
    },

    note: String,

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
