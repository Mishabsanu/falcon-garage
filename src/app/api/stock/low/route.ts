import { connectDB } from "@/lib/mongodb";
import Part from "@/models/Part";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const parts = await Part.find({
    $expr: {
      $lte: ["$stock", "$minStock"],
    },
  });

  return NextResponse.json({
    success: true,
    data: parts,
  });
}
