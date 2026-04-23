import { connectDB } from "@/lib/mongodb"
import JobCard from "@/models/JobCard"
import Quotation from "@/models/Quotation"
import { generateNumber } from "@/utils/generateNumber"
import { authMiddleware } from "@/middleware/authMiddleware"
import { roleGuard } from "@/middleware/roleGuard"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

await connectDB()

const user: any = await authMiddleware()

roleGuard(user.role, ["ADMIN", "SERVICE_ADVISOR"])

const { quotationId } = await req.json()

const quotation = await Quotation.findById(quotationId)

if (!quotation)
throw new Error("Quotation not found")

if (quotation.status !== "approved")
throw new Error("Quotation must be approved first")

const jobCardNumber = await generateNumber("JC")

const jobCard = await JobCard.create({
jobCardNumber,
customerId: quotation.customerId,
vehicleId: quotation.vehicleId,
quotationIds: [quotation._id],
items: quotation.items || [],
})

quotation.status = "converted"
quotation.jobCardId = jobCard._id

await quotation.save()

return NextResponse.json({
success: true,
data: jobCard,
})
}