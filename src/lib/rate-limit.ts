type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  retryAfter: number;
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore?: Map<string, RateLimitRecord>;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitStore = store;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      success: true,
      retryAfter: Math.ceil(options.windowMs / 1000),
    };
  }

  if (current.count >= options.limit) {
    return {
      success: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    success: true,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  };
}
