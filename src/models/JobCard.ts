import mongoose from "mongoose";

const JobCardSchema = new mongoose.Schema(
  {
    jobCardNumber: String,
    lpoNumber: String,

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    quotationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quotation",
      },
    ],

    technicians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],

    complaints: [String],
    
    mileage: Number,

    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "waiting_approval", "completed", "closed"],
      default: "open",
    },

    startTime: Date,
    endTime: Date,
    estimatedCompletion: Date,
  },
  { timestamps: true },
);

export default mongoose.models.JobCard ||
  mongoose.model("JobCard", JobCardSchema);
