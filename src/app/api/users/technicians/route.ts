import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * GET ALL TECHNICIANS
 * Returns a list of all workshop personnel with the "TECHNICIAN" role.
 */
export async function GET() {
  await connectDB();

  try {
    const technicians = await User.find({ role: "TECHNICIAN" })
      .select("name email role")
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: technicians
    });
  } catch (error) {
    console.error("Staff lookup failure:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
