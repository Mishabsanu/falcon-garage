import mongoose from "mongoose"

const VehicleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    vehicleNumber: String,
    vin: String,
    engineNumber: String,
    brand: String,
    model: String,
    color: String,
  },
  { timestamps: true }
)

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema)