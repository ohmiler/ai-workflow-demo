"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "password", string[]>>;

type RegisterErrorResponse = {
  error?: string;
  fields?: FieldErrors;
};

function getErrorMessage(data: RegisterErrorResponse) {
  const fieldError =
    data.fields?.name?.[0] ?? data.fields?.email?.[0] ?? data.fields?.password?.[0];

  return fieldError ?? data.error ?? "Unable to create account";
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = (await response.json()) as RegisterErrorResponse;

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="register-title">
        <aside className="auth-story" aria-label="AI Workflow">
          <div className="auth-brand">
            <span className="auth-brand-mark">AI</span>
            <span>AI Workflow</span>
          </div>

          <div className="auth-story-copy">
            <p className="auth-story-kicker">Start clean</p>
            <h2 className="auth-story-title">Create a secure workspace login.</h2>
            <p className="auth-story-text">
              Register with a hashed password and continue into the test auth flow.
            </p>
            <div className="auth-status-strip" aria-label="Authentication features">
              <span className="auth-status-item">Zod validation</span>
              <span className="auth-status-item">bcrypt</span>
              <span className="auth-status-item">Rate limited</span>
            </div>
          </div>
        </aside>

        <div className="auth-form-area">
          <div className="auth-form-header">
            <p className="auth-eyebrow">Register</p>
            <h1 id="register-title" className="auth-title">
              Create your account
            </h1>
            <p className="auth-subtitle">
              Set up a local demo account for the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span className="auth-label-row">Name</span>
              <input
                className="auth-input"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={isLoading}
                placeholder="Your name"
              />
            </label>

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
              <span className="auth-label-row">
                Password
                <span className="auth-hint">8-72 characters</span>
              </span>
              <input
                className="auth-input"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                disabled={isLoading}
                placeholder="Create a password"
              />
            </label>

            {error ? (
              <p role="alert" className="auth-error">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link className="auth-switch-link" href="/login">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
