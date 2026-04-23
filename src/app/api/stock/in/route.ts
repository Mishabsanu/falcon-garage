import { connectDB } from "@/lib/mongodb";
import Part from "@/models/Part";
import StockTransaction from "@/models/StockTransaction";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { partId, quantity } = await req.json();

  const part = await Part.findById(partId);

  if (!part) throw new Error("Part not found");

  part.stock += quantity;

  await part.save();

  await StockTransaction.create({
    partId,
    type: "IN",
    quantity,
    referenceType: "purchase",
  });

  return NextResponse.json({
    success: true,
    data: part,
  });
}
