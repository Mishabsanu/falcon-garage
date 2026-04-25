import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: String,
    email: String,
    address: String,
    contactPerson: String,
    category: String,
    gstNumber: String,
  },
  { timestamps: true },
);

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
