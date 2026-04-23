import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword } from "@/utils/hash";
import { signToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 },
    );
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    );
  }

  const token = signToken({
    id: user._id,
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
    role: user.role,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  response.cookies.set("role", user.role, {
    httpOnly: false,
    path: "/",
  });

  response.cookies.set("name", user.name, {
    httpOnly: false,
    path: "/",
  });

  return response;
}
