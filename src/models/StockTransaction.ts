import mongoose from "mongoose";

const StockTransactionSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
    },

    type: {
      type: String,
      enum: ["IN", "OUT"],
    },

    quantity: Number,

    referenceType: {
      type: String,
      enum: ["purchase", "invoice", "manual_adjustment"],
    },

    referenceId: String,
  },
  { timestamps: true },
);

export default mongoose.models.StockTransaction ||
  mongoose.model("StockTransaction", StockTransactionSchema);
