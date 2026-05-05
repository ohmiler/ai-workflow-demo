import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../../lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? verifyAuthToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f6f7f9",
        color: "#111827",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          padding: 32,
          border: "1px solid #d8dde6",
          borderRadius: 8,
          background: "#ffffff",
          boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#586174",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Auth demo
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.15,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: "16px 0 0", color: "#374151", lineHeight: 1.6 }}>
          Welcome, {user.name}. This page is protected by a signed auth cookie.
        </p>
      </section>
    </main>
  );
}
