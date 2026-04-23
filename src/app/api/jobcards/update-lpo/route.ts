import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import { authMiddleware } from "@/middleware/authMiddleware";
import { roleGuard } from "@/middleware/roleGuard";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const user: any = await authMiddleware();
    roleGuard(user.role, ["ADMIN", "SERVICE_ADVISOR", "TECHNICIAN"]);

    const { jobCardId, lpoNumber } = await req.json();

    const jobCard = await JobCard.findByIdAndUpdate(
      jobCardId,
      { lpoNumber },
      { new: true }
    );

    if (!jobCard) {
      return NextResponse.json({ success: false, message: "Node not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: jobCard,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "LPO Update Failure",
    }, { status: 500 });
  }
}
