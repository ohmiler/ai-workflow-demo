import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Logout success" });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
