import { createHmac, timingSafeEqual } from "crypto";

export const AUTH_COOKIE_NAME = "auth_token";

const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  name: string;
  email: string;
  exp: number;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (
      !secret ||
      secret.length < 32 ||
      secret === "development-only-auth-secret-change-me"
    ) {
      throw new Error("AUTH_SECRET with at least 32 characters is required in production");
    }

    return secret;
  }

  return secret ?? "development-only-auth-secret-change-me";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function createAuthToken(user: AuthUser) {
  const payload: AuthTokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + AUTH_TOKEN_MAX_AGE_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    maxAge: AUTH_TOKEN_MAX_AGE_SECONDS,
  };
}

export function verifyAuthToken(token: string): AuthUser | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (!signaturesMatch(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as Partial<AuthTokenPayload>;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
