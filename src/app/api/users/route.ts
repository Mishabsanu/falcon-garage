import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/utils/hash";
 
export async function GET() {
  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
 
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (body.password) {
      body.password = await hashPassword(body.password);
    }

    const user = await User.create(body);
    const userObj = user.toObject();
    delete userObj.password;
    return NextResponse.json({ success: true, data: userObj }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
