import mongoose from "mongoose"

const CustomerSchema = new mongoose.Schema(
  {
    customerNumber: String,
    name: String,
    phone: String,
    email: String,
    address: String,
    customerType: {
      type: String,
      enum: ["cash", "credit"],
      default: "cash",
    },
  },
  { timestamps: true }
)

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema)