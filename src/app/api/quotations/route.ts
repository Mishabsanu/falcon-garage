import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Quotation from "@/models/Quotation";
import JobCard from "@/models/JobCard";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getErrorStatus(error: unknown) {
  return error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
}

export async function POST(req: Request) {
  try {
    await authMiddleware();
    await connectDB();

    const body = await req.json();
    const quotationNumber = await generateNumber("QTN");

    const quotation = await Quotation.create({
      ...body,
      quotationNumber,
      status: "draft"
    });

    // Link back to Job Card if provided
    if (body.jobCardId) {
      await JobCard.findByIdAndUpdate(body.jobCardId, {
        $push: { quotationIds: quotation._id }
      });
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error, "Proposal Draft Failure"),
    }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await authMiddleware();
    await connectDB();

    const { id, ...body } = await req.json();
    const quotation = await Quotation.findByIdAndUpdate(id, body, { new: true });

    if (!quotation) {
      return NextResponse.json({
        success: false,
        message: "Quotation not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error, "Quotation update failed"),
    }, { status: getErrorStatus(error) });
  }
}

export async function DELETE(req: Request) {
  try {
    await authMiddleware();
    await connectDB();

    const { id } = await req.json();
    await Quotation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error, "Quotation delete failed"),
    }, { status: getErrorStatus(error) });
  }
}
