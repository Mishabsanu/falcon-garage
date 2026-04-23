import { connectDB } from "@/lib/mongodb"
import JobCard from "@/models/JobCard"
import { generateNumber } from "@/utils/generateNumber"
import { authMiddleware } from "@/middleware/authMiddleware"
import { roleGuard } from "@/middleware/roleGuard"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

await connectDB()

const user: any = await authMiddleware()

roleGuard(user.role, ["ADMIN", "SERVICE_ADVISOR"])

const body = await req.json()

const jobCardNumber = await generateNumber("JC")

const jobCard = await JobCard.create({
jobCardNumber,
customerId: body.customerId,
vehicleId: body.vehicleId,
})

return NextResponse.json({
success: true,
data: jobCard,
})
}