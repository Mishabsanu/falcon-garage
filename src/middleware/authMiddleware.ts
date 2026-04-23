import { cookies } from "next/headers"
import { verifyToken } from "@/utils/jwt"

export async function authMiddleware() {
  const cookieStore = await cookies()

  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  return verifyToken(token)
}