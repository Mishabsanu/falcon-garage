import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import JobCard from "@/models/JobCard";
import Part from "@/models/Part";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // today's revenue

  const todayStart = new Date();

  todayStart.setHours(0, 0, 0, 0);

  const todayRevenueInvoices = await Invoice.find({
    createdAt: { $gte: todayStart },
  });

  const todayRevenue = todayRevenueInvoices.reduce(
    (sum, inv) => sum + inv.paidAmount,
    0,
  );

  // active jobs

  const activeJobs = await JobCard.countDocuments({
    status: {
      $in: ["open", "in_progress"],
    },
  });

  // pending payments

  const pendingPayments = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalPending: {
          $sum: "$balanceAmount",
        },
      },
    },
  ]);

  // low stock alerts

  const lowStockParts = await Part.countDocuments({
    $expr: {
      $lte: ["$stock", "$minStock"],
    },
  });

  // technician workload summary

  const technicians = await User.find({
    role: "TECHNICIAN",
  });

  const technicianSummary = [];

  for (const tech of technicians) {
    const assigned = await JobCard.countDocuments({
      technicians: tech._id,
    });

    const active = await JobCard.countDocuments({
      technicians: tech._id,
      status: {
        $in: ["open", "in_progress"],
      },
    });

    technicianSummary.push({
      name: tech.name,

      assigned,

      active,
    });
  }

  // recent job cards

  const recentJobs = await JobCard.find().sort({ createdAt: -1 }).limit(5);

  // recent invoices

  const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

  return NextResponse.json({
    success: true,

    data: {
      todayRevenue,

      activeJobs,

      pendingPayments: pendingPayments[0]?.totalPending || 0,

      lowStockParts,

      technicianSummary,

      recentJobs,

      recentInvoices,
    },
  });
}
