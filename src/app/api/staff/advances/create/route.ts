import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import StaffAdvance from "@/models/StaffAdvance";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await authMiddleware();
    await connectDB();

    const { staffId, amount, reason, method } = await req.json();

    if (!staffId || !amount) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 });
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      return NextResponse.json({ success: false, message: "Personnel record not found" }, { status: 404 });
    }

    // 1. Create Advance Record
    const advance = await StaffAdvance.create({
      staffId,
      amount,
      reason,
      method,
      date: new Date()
    });

    // 2. Update Total Advances in User model
    staff.totalAdvances = (staff.totalAdvances || 0) + amount;
    await staff.save();

    return NextResponse.json({
      success: true,
      data: advance,
      message: "Advance payment successfully registered"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Advance Registry Failure"
    }, { status: 500 });
  }
}
