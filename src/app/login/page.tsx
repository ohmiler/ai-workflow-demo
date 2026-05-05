"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type FieldErrors = Partial<Record<"email" | "password", string[]>>;

type LoginErrorResponse = {
  error?: string;
  fields?: FieldErrors;
};

function getErrorMessage(data: LoginErrorResponse) {
  const fieldError = data.fields?.email?.[0] ?? data.fields?.password?.[0];

  return fieldError ?? data.error ?? "Unable to login";
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = (await response.json()) as LoginErrorResponse;

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <aside className="auth-story" aria-label="AI Workflow">
          <div className="auth-brand">
            <span className="auth-brand-mark">AI</span>
            <span>AI Workflow</span>
          </div>

          <div className="auth-story-copy">
            <p className="auth-story-kicker">Secure access</p>
            <h2 className="auth-story-title">Welcome back to your workflow.</h2>
            <p className="auth-story-text">
              Sign in to continue testing the protected dashboard and auth flow.
            </p>
            <div className="auth-status-strip" aria-label="Authentication features">
              <span className="auth-status-item">SQLite</span>
              <span className="auth-status-item">Prisma</span>
              <span className="auth-status-item">Signed cookie</span>
            </div>
          </div>
        </aside>

        <div className="auth-form-area">
          <div className="auth-form-header">
            <p className="auth-eyebrow">Login</p>
            <h1 id="login-title" className="auth-title">
              Continue your session
            </h1>
            <p className="auth-subtitle">
              Use the account you created to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span className="auth-label-row">Email</span>
              <input
                className="auth-input"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                placeholder="you@example.com"
              />
            </label>

            <label className="auth-field">
              <span className="auth-label-row">Password</span>
              <input
                className="auth-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </label>

            {error ? (
              <p role="alert" className="auth-error">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            Need an account?{" "}
            <Link className="auth-switch-link" href="/register">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
