import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String, // e.g., "2024-04"
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    advanceTaken: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: Number,
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid"],
      default: "unpaid",
    },
    paymentHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        mode: String,
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Salary || mongoose.model("Salary", SalarySchema);
