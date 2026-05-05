"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Unable to logout. Please try again.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Unable to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dashboard-logout-group">
      <button
        className="dashboard-logout"
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? "Signing out..." : "Logout"}
      </button>
      {error ? (
        <p className="dashboard-logout-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
