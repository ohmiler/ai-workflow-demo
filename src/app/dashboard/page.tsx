import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../../lib/auth";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? verifyAuthToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="dashboard-shell">
      <section className="dashboard-frame" aria-labelledby="dashboard-title">
        <header className="dashboard-topbar">
          <div className="dashboard-brand">
            <span className="dashboard-brand-mark">AI</span>
            <span>AI Workflow</span>
          </div>
          <LogoutButton />
        </header>

        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Protected dashboard</p>
            <h1 id="dashboard-title" className="dashboard-title">
              Welcome, {user.name}
            </h1>
            <p className="dashboard-subtitle">
              Your signed auth cookie is valid. This page is rendered on the server
              after verifying the session token.
            </p>
          </div>

          <div className="dashboard-user">
            <span className="dashboard-avatar">{initials || "U"}</span>
            <div>
              <p className="dashboard-user-name">{user.name}</p>
              <p className="dashboard-user-email">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid" aria-label="Authentication status">
          <article className="dashboard-card">
            <p className="dashboard-card-label">Session</p>
            <h2 className="dashboard-card-value">Active</h2>
            <p className="dashboard-card-text">Verified from `auth_token` cookie.</p>
          </article>

          <article className="dashboard-card">
            <p className="dashboard-card-label">Runtime</p>
            <h2 className="dashboard-card-value">Node.js</h2>
            <p className="dashboard-card-text">Prisma and cookie signing run server-side.</p>
          </article>

          <article className="dashboard-card">
            <p className="dashboard-card-label">Security</p>
            <h2 className="dashboard-card-value">HttpOnly</h2>
            <p className="dashboard-card-text">Logout clears the browser session cookie.</p>
          </article>
        </section>

        <section className="dashboard-panel" aria-label="Account details">
          <div>
            <p className="dashboard-panel-label">Account email</p>
            <p className="dashboard-panel-value">{user.email}</p>
          </div>
          <div>
            <p className="dashboard-panel-label">User ID</p>
            <p className="dashboard-panel-value">{user.id}</p>
          </div>
        </section>
      </section>
    </main>
  );
}
