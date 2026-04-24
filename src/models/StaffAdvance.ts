import mongoose from "mongoose";

const StaffAdvanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      default: "Salary Advance",
    },
    method: {
      type: String,
      enum: ["cash", "bank"],
      default: "cash",
    },
  },
  { timestamps: true }
);

export default mongoose.models.StaffAdvance || mongoose.model("StaffAdvance", StaffAdvanceSchema);
