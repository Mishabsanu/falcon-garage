import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: String,

    message: String,

    type: {
      type: String,
      enum: [
        "LOW_STOCK",
        "PAYMENT_PENDING",
        "JOB_ASSIGNED",
        "JOB_COMPLETED",
        "QUOTATION_PENDING",
      ],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    referenceId: String,
  },
  { timestamps: true },
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
