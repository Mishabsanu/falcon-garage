import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { technicianId } = await req.json();

  const jobs = await JobCard.find({
    technicians: technicianId,
  })
    .populate("vehicleId")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,

    data: jobs,
  });
}
