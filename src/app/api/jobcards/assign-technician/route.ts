import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import JobCard from "@/models/JobCard";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const { jobCardId, technicianId } = await req.json();

    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
      return NextResponse.json({ success: false, message: "Order node not found" }, { status: 404 });
    }

    jobCard.technicians = [technicianId];
    jobCard.status = "assigned";
    await jobCard.save();

    // Create Notification for technician (Trigger Step 6)
    await Notification.create({
      title: "New Job Assignment",
      message: `You have been assigned to Job Card #${jobCard.jobCardNumber}`,
      type: "JOB_ASSIGNED",
      referenceId: jobCard._id,
      userId: technicianId
    });

    return NextResponse.json({
      success: true,
      message: "Technician node deployed to order",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Assignment Failure",
    }, { status: 500 });
  }
}
