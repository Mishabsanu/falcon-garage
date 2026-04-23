import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import Part from "@/models/Part";
import User from "@/models/User";
import Salary from "@/models/Salary";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [
      invoices,
      jobCards,
      quotations,
      parts,
      technicians,
      salaries
    ] = await Promise.all([
      Invoice.find(dateFilter),
      JobCard.find(dateFilter),
      Quotation.find(dateFilter),
      Part.find(),
      User.find({ role: "TECHNICIAN" }),
      Salary.find(dateFilter),
    ]);

    // Financial Analysis
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalPending = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);
    
    const partialPayments = invoices.filter(inv => inv.status === 'partial').length;
    const fullPayments = invoices.filter(inv => inv.status === 'paid').length;

    // Workforce Finance (Salaries & Advances)
    const totalSalaries = salaries.reduce((sum, sal) => sum + (sal.baseSalary || 0), 0);
    const totalAdvances = salaries.reduce((sum, sal) => sum + (sal.advanceTaken || 0), 0);
    const netSalaryPaid = salaries.filter(sal => sal.status === 'paid').reduce((sum, sal) => sum + (sal.netSalary || 0), 0);

    // Job Card Analysis
    const jobStatusBreakdown = {
      open: jobCards.filter(j => j.status === 'open').length,
      assigned: jobCards.filter(j => j.status === 'assigned').length,
      in_progress: jobCards.filter(j => j.status === 'in_progress').length,
      completed: jobCards.filter(j => j.status === 'completed').length,
      closed: jobCards.filter(j => j.status === 'closed').length,
      total: jobCards.length
    };

    // Quotation Analysis
    const quotationAnalysis = {
      total: quotations.length,
      approved: quotations.filter(q => q.status === 'approved').length,
      rejected: quotations.filter(q => q.status === 'rejected').length,
      draft: quotations.filter(q => q.status === 'draft').length,
      converted: quotations.filter(q => q.status === 'converted').length,
    };

    // Inventory Analysis
    const inventoryAnalysis = {
      totalItems: parts.length,
      lowStock: parts.filter(p => p.stock <= p.minStock).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        financials: { 
          totalRevenue, 
          totalPaid, 
          totalPending, 
          partialPayments, 
          fullPayments 
        },
        workforce: {
          techniciansCount: technicians.length,
          totalSalaries,
          totalAdvances,
          netSalaryPaid
        },
        jobs: jobStatusBreakdown,
        quotations: quotationAnalysis,
        inventory: inventoryAnalysis,
        period: { startDate, endDate }
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
