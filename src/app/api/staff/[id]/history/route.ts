import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Salary from "@/models/Salary";
import StaffAdvance from "@/models/StaffAdvance";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authMiddleware();
    await connectDB();

    const { id: staffId } = await params;
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [user, advances, salaries, monthAdvances, monthSalary] = await Promise.all([
      User.findById(staffId),
      StaffAdvance.find({ staffId }).sort({ date: -1 }),
      Salary.find({ employeeId: staffId }).sort({ createdAt: -1 }),
      StaffAdvance.find({ 
        staffId, 
        date: { $gte: startOfMonth, $lte: endOfMonth } 
      }),
      Salary.findOne({ employeeId: staffId, month: currentMonthStr })
    ]);

    if (!user) {
      return NextResponse.json({ success: false, message: "Personnel not found" }, { status: 404 });
    }

    // Calculations for the Monthly Reconciliation Node
    const monthAdvancesTotal = monthAdvances.reduce((sum, a) => sum + a.amount, 0);
    const monthPaymentsTotal = monthSalary ? monthSalary.paymentHistory.reduce((sum: number, p: any) => sum + p.amount, 0) : 0;
    
    const netEntitlement = (user.baseSalary || 0) - monthAdvancesTotal;
    const remainingBalance = netEntitlement - monthPaymentsTotal;

    return NextResponse.json({
      success: true,
      data: {
        user,
        advances,
        salaries,
        reconciliation: {
          month: currentMonthStr,
          grossEntitlement: user.baseSalary || 0,
          advanceDeductions: monthAdvancesTotal,
          netEntitlement: Math.max(0, netEntitlement),
          totalDispersed: monthPaymentsTotal,
          remainingBalance: Math.max(0, remainingBalance)
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
