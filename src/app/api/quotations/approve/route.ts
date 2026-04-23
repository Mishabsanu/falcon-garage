import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import { roleGuard } from "@/middleware/roleGuard";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const user: any = await authMiddleware();

  roleGuard(user.role, ["ADMIN", "SERVICE_ADVISOR"]);

  const { quotationId } = await req.json();

  const quotation = await Quotation.findByIdAndUpdate(
    quotationId,
    { status: "approved" },
    { new: true },
  );

  return NextResponse.json({
    success: true,
    data: quotation,
  });
}
