import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const technicians = await User.find({
    role: "TECHNICIAN",
  });

  const result = [];

  for (const tech of technicians) {
    const assignedJobs = await JobCard.countDocuments({
      technicians: tech._id,
    });

    const completedJobs = await JobCard.countDocuments({
      technicians: tech._id,
      status: "completed",
    });

    const activeJobs = await JobCard.countDocuments({
      technicians: tech._id,
      status: {
        $in: ["open", "in_progress"],
      },
    });

    const completionRate =
      assignedJobs === 0 ? 0 : Math.round((completedJobs / assignedJobs) * 100);

    result.push({
      technicianId: tech._id,

      name: tech.name,

      assignedJobs,

      completedJobs,

      activeJobs,

      completionRate,
    });
  }

  return NextResponse.json({
    success: true,

    data: result,
  });
}
