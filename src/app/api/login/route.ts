import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, createAuthToken } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";
import { loginSchema } from "../../../lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const clientIp = getClientIp(request);
  const limit = rateLimit(`login:${clientIp}:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter),
        },
      },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const authToken = createAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, authToken.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: authToken.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
