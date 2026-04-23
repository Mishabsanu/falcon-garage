import { connectDB } from "@/lib/mongodb";
import Part from "@/models/Part";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const parts = await Part.find().sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      data: parts,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Component sync failure",
    }, { status: 500 });
  }
}
