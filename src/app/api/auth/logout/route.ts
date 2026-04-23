import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear all cookies from the server side
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("role", "", {
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("name", "", {
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
