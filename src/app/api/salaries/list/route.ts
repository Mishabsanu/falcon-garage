import { connectDB } from "@/lib/mongodb";
import Salary from "@/models/Salary";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const salaries = await Salary.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: salaries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
