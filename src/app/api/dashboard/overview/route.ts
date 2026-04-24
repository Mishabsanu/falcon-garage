import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import JobCard from "@/models/JobCard";
import Part from "@/models/Part";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Concurrent Telemetry Retrieval
    const [
      todayRevenueInvoices,
      activeJobsCount,
      pendingPayments,
      lowStockParts,
      technicians,
      recentJobs,
      recentInvoices,
      monthInvoices,
      totalInventoryValuation
    ] = await Promise.all([
      Invoice.find({ createdAt: { $gte: todayStart } }),
      JobCard.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      Invoice.aggregate([{ $group: { _id: null, totalPending: { $sum: "$balanceAmount" } } }]),
      Part.countDocuments({ $expr: { $lte: ["$stock", "$minStock"] } }),
      User.find({ role: "TECHNICIAN" }),
      JobCard.find().populate('technicians', 'name').sort({ createdAt: -1 }).limit(6),
      Invoice.find().sort({ createdAt: -1 }).limit(5),
      Invoice.find({ createdAt: { $gte: monthStart } }),
      Part.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$stock", "$price"] } } } }])
    ]);

    const todayRevenue = todayRevenueInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    
    // Technician Workload Analysis
    const technicianSummary = await Promise.all(technicians.map(async (tech) => {
      const active = await JobCard.countDocuments({
        technicians: tech._id,
        status: { $in: ["open", "in_progress"] }
      });
      return { name: tech.name, active, id: tech._id };
    }));

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue,
        monthRevenue,
        activeJobs: activeJobsCount,
        pendingPayments: pendingPayments[0]?.totalPending || 0,
        lowStockParts,
        technicianSummary,
        recentJobs,
        recentInvoices,
        inventoryValuation: totalInventoryValuation[0]?.total || 0,
        performanceMetric: 98.4 // Simulated benchmark
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
