import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";
import { registerSchema } from "../../../lib/validations/auth";

export const runtime = "nodejs";

const registerAcceptedResponse = () =>
  NextResponse.json(
    { message: "Registration request accepted" },
    { status: 201 },
  );

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

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const clientIp = getClientIp(request);
  const ipLimit = rateLimit(`register:ip:${clientIp}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  const emailLimit = rateLimit(`register:email:${email}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.success || !emailLimit.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(ipLimit.retryAfter, emailLimit.retryAfter)),
        },
      },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return registerAcceptedResponse();
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return registerAcceptedResponse();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return registerAcceptedResponse();
    }

    console.error("Register API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
