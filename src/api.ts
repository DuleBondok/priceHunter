/**
 * Shared API helpers for admin tools.
 * Set REACT_APP_API_BASE_URL in .env (prod: https://api.pricely.rs).
 */
const TOKEN_KEY = "pricely_admin_token";

export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export function getAdminToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return getAdminToken().length > 0;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAdminToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    clearAdminToken();
    const here = window.location.pathname + window.location.search;
    if (!here.startsWith("/login")) {
      window.location.assign(`/login`);
    }
  }

  return res;
}
