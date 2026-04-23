import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import { roleGuard } from "@/middleware/roleGuard";
import Customer from "@/models/Customer";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user: any = await authMiddleware();
  roleGuard(user.role, ["ADMIN", "SERVICE_ADVISOR"]);
  await connectDB();

  const body = await req.json();

  const number = await generateNumber("CUS");

  const customer = await Customer.create({
    ...body,
    customerNumber: number,
  });

  return NextResponse.json({
    success: true,
    data: customer,
  });
}
