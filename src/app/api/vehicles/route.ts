import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Vehicle from "@/models/Vehicle";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const body = await req.json();

    const vehicle = await Vehicle.create(body);

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Initialization failure",
    }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
