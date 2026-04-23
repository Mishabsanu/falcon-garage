import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const outstandingCustomers = await Invoice.aggregate([
    {
      $group: {
        _id: "$customerId",

        totalPending: {
          $sum: "$balanceAmount",
        },
      },
    },

    {
      $match: {
        totalPending: { $gt: 0 },
      },
    },
  ]);

  return NextResponse.json({
    success: true,

    data: outstandingCustomers,
  });
}
