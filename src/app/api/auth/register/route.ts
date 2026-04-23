import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/utils/hash";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const hashedPassword = await hashPassword(body.password);

  const user = await User.create({
    ...body,
    password: hashedPassword,
  });

  return NextResponse.json({
    success: true,
    data: user,
  });
}
