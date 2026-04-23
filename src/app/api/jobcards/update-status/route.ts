import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import JobCard from "@/models/JobCard";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const body = await req.json();
    const { jobCardId, status, items } = body;

    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
      return NextResponse.json({ success: false, message: "Order node not found" }, { status: 404 });
    }

    if (status) {
      jobCard.status = status;
      if (status === "in_progress") jobCard.startTime = new Date();
      if (status === "completed") jobCard.endTime = new Date();
    }
    
    if (items) {
      jobCard.items = items;
    }
    
    await jobCard.save();

    // Trigger notification if completed (Step 8)
    if (status === "completed") {
      await Notification.create({
        title: "Repair Completed",
        message: `Job Card #${jobCard.jobCardNumber} has been marked as COMPLETED. Ready for invoicing.`,
        type: "job_completed",
        referenceId: jobCard._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: `State transitioned to ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "State Transition Failure",
    }, { status: 500 });
  }
}
