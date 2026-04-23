export function roleGuard(
  userRole: string,
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Access denied")
  }
}