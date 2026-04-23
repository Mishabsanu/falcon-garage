import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: String,
    vendorName: String,
    items: [
      {
        partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
        name: String,
        qty: Number,
        receivedQty: { type: Number, default: 0 },
        costPrice: Number,
        total: Number,
      }
    ],
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "partial", "received", "cancelled"],
      default: "pending",
    },
    receivedDate: Date,
  },
  { timestamps: true }
);

if (mongoose.models.Purchase) {
  delete mongoose.models.Purchase;
}

export default mongoose.model("Purchase", PurchaseSchema);
