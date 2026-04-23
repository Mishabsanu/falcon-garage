import { connectDB } from "@/lib/mongodb";
import Part from "@/models/Part";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  await connectDB();

const body = await req.json()

const part = await Part.create(body)

return NextResponse.json({
success: true,
data: part,
})
}