import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import JobCard from "@/models/JobCard";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch users with role TECHNICIAN
    const technicians = await User.find({ role: "TECHNICIAN" }).select("name email role");
    
    // For each technician, count their active (in_progress or assigned) jobs
    const techsWithJobs = await Promise.all(technicians.map(async (tech) => {
      const activeCount = await JobCard.countDocuments({
        technicians: tech._id,
        status: { $in: ["assigned", "in_progress"] }
      });
      return {
        ...tech.toObject(),
        activeJobs: activeCount
      };
    }));
    
    return NextResponse.json({
      success: true,
      data: techsWithJobs,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Technician Node Sync Failure",
    }, { status: 500 });
  }
}
