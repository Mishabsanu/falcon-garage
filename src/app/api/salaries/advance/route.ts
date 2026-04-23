import { connectDB } from "@/lib/mongodb";
import Salary from "@/models/Salary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { salaryId, amount } = await req.json();
    
    const salary = await Salary.findById(salaryId);
    if (!salary) return NextResponse.json({ success: false, message: "Salary node not found" }, { status: 404 });

    salary.advanceTaken += Number(amount);
    salary.netSalary = salary.baseSalary - salary.advanceTaken - salary.deductions;
    
    await salary.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
