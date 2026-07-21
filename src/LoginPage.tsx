import React, { FormEvent, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  API_BASE,
  clearAdminToken,
  isAdminAuthenticated,
  setAdminToken,
} from "./api";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminAuthenticated()) {
    const from =
      (location.state as { from?: string } | null)?.from || "/admin";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!t) {
      setError("Unesi ADMIN_API_TOKEN.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/scraping/status`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        clearAdminToken();
        setError(
          "Token odbijen (401). Mora biti isti kao ADMIN_API_TOKEN na Renderu.",
        );
        return;
      }
      if (!res.ok) {
        setError(`API greška ${res.status} na ${API_BASE}`);
        return;
      }
      setAdminToken(t);
      const from =
        (location.state as { from?: string } | null)?.from || "/admin";
      navigate(from, { replace: true });
    } catch {
      setError(`Ne mogu da dosegnem API: ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminHub" style={{ maxWidth: 420, margin: "4rem auto" }}>
      <h1 className="adminHubTitle">Admin login</h1>
      <p className="adminHubSubtitle">
        Unesi isti token kao <code>ADMIN_API_TOKEN</code> na{" "}
        <code>pricehunterserver</code> (Render).
      </p>
      <p className="adminHubSubtitle" style={{ fontSize: "0.85rem" }}>
        API: {API_BASE}
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="ADMIN_API_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ padding: "0.65rem 0.75rem", fontSize: "1rem" }}
        />
        {error ? (
          <p style={{ color: "#b00020", margin: 0 }}>{error}</p>
        ) : null}
        <button
          type="submit"
          className="adminHubCard"
          style={{ cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Provera…" : "Uloguj se"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
