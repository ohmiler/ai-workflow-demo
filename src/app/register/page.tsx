"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties, FormEvent } from "react";
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
    <main style={styles.page}>
      <section style={styles.panel} aria-labelledby="register-title">
        <div style={styles.header}>
          <p style={styles.eyebrow}>Create account</p>
          <h1 id="register-title" style={styles.title}>
            Register
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.field}>
            <span style={styles.label}>Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isLoading}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isLoading}
              style={styles.input}
            />
          </label>

          {error ? (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#f6f7f9",
    color: "#111827",
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    padding: 32,
    border: "1px solid #d8dde6",
    borderRadius: 8,
    background: "#ffffff",
    boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#586174",
    fontSize: 14,
    fontWeight: 600,
  },
  title: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: 0,
  },
  form: {
    display: "grid",
    gap: 18,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#263041",
  },
  input: {
    width: "100%",
    minHeight: 44,
    boxSizing: "border-box",
    border: "1px solid #c8ced8",
    borderRadius: 6,
    padding: "10px 12px",
    color: "#111827",
    background: "#ffffff",
    fontSize: 16,
    outlineColor: "#2563eb",
  },
  error: {
    margin: 0,
    padding: "10px 12px",
    borderRadius: 6,
    background: "#fff1f2",
    color: "#be123c",
    fontSize: 14,
    lineHeight: 1.4,
  },
  button: {
    minHeight: 44,
    border: 0,
    borderRadius: 6,
    padding: "10px 14px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
} satisfies Record<string, CSSProperties>;
