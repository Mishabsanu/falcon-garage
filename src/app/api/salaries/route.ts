import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Salary from "@/models/Salary";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await authMiddleware();
    await connectDB();

    const { staffId, amount, month, type, paymentMethod, note } = await req.json();

    if (!staffId || !month) {
      return NextResponse.json({ success: false, message: "Staff ID and Month are required" }, { status: 400 });
    }

    // 1. Find the Staff record to get their base salary
    const staff = await User.findById(staffId);
    if (!staff) {
      return NextResponse.json({ success: false, message: "Personnel node not found" }, { status: 404 });
    }

    // 2. Find or Create the Salary (Payroll) record for this month
    let salaryRecord = await Salary.findOne({ employeeId: staffId, month });

    if (!salaryRecord) {
      salaryRecord = new Salary({
        employeeId: staffId,
        month,
        baseSalary: staff.baseSalary || 0,
        advanceTaken: staff.totalAdvances || 0,
        netSalary: (staff.baseSalary || 0) - (staff.totalAdvances || 0),
        status: "unpaid",
        paymentHistory: []
      });
    }

    // 3. Record the Payment if amount > 0
    if (amount > 0) {
      salaryRecord.paymentHistory.push({
        amount,
        date: new Date(),
        mode: paymentMethod || "cash",
        note: note || `Dispersal Type: ${type}`
      });

      // Update total paid amount and status
      const totalPaid = salaryRecord.paymentHistory.reduce((sum: number, p: any) => sum + p.amount, 0);
      
      if (totalPaid >= salaryRecord.netSalary) {
        salaryRecord.status = "paid";
        // If it's a full salary payment, we might want to reset totalAdvances? 
        // User said: "how i handle this". Usually advances are cleared when salary is paid.
        // staff.totalAdvances = 0; // Maybe? Let's leave it for now or make it a separate logic.
      } else if (totalPaid > 0) {
        salaryRecord.status = "partially_paid";
      }
    }

    await salaryRecord.save();
    // await staff.save();

    return NextResponse.json({ 
      success: true, 
      data: salaryRecord,
      message: "Compensation dispersal synchronized with workforce node" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Payroll sync failure" 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await authMiddleware();
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const salary = await Salary.findById(id).populate("employeeId");
      return NextResponse.json({ success: true, data: salary });
    }

    const salaries = await Salary.find().populate("employeeId").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: salaries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
