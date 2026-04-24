import mongoose from "mongoose";

export type Role =
  | "ADMIN"
  | "SERVICE_ADVISOR"
  | "TECHNICIAN"
  | "ACCOUNTANT"
  | "STORE_MANAGER";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "ACCOUNTANT",
        "STORE_MANAGER",
      ],
      default: "SERVICE_ADVISOR",
    },
    baseSalary: {
      type: Number,
      default: 0,
    },
    totalAdvances: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
