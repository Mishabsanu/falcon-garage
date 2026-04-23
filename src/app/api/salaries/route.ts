import { connectDB } from "@/lib/mongodb";
import Salary from "@/models/Salary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { employeeId, month, baseSalary } = await req.json();
    
    const salary = await Salary.create({
      employeeId,
      month,
      baseSalary,
      netSalary: baseSalary,
      status: "unpaid"
    });

    return NextResponse.json({ success: true, data: salary });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
