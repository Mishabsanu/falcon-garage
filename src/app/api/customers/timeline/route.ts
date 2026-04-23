
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import JobCard from "@/models/JobCard";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { customerId } = await req.json();

  const jobCards = await JobCard.find({ customerId });

  const invoices = await Invoice.find({ customerId });

  return NextResponse.json({
    success: true,

    timeline: [...jobCards, ...invoices].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}
