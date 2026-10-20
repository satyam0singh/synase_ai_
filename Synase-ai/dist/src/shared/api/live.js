// @ts-check
/* Live authentication adapter for the Spring Boot orchestrator. */

import { ApiError } from "./errors.js";

// Public backend URL; no credentials or private keys belong in this file.
export const API_BASE_URL = "https://synase-orchestrator.onrender.com";
const TOKEN_KEY = "synase_access_token";

export function getAccessToken() {
  try {
    return globalThis.localStorage?.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function saveAccessToken(token) {
  try {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
  } catch {
    throw new ApiError("STORAGE_UNAVAILABLE", "Could not save your sign-in session in this browser.", 500);
  }
}

export function clearAccessToken() {
  try {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
  } catch {
    // Logout still completes in memory if browser storage is unavailable.
  }
}

async function request(path, { method = "GET", body, authenticated = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getAccessToken();
  if (authenticated && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new ApiError("BACKEND_UNAVAILABLE", "Could not reach the backend. It may be waking up; please try again shortly.", 503);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authenticated) clearAccessToken();
    const message = data?.message || data?.error?.message || `Backend request failed (${response.status}).`;
    throw new ApiError(data?.code || "BACKEND_ERROR", message, response.status, data);
  }
  return data;
}

function splitName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "User"
  };
}

export const liveApi = {
  async login({ email, password }) {
    const user = await request("/api/auth/login", {
      method: "POST",
      body: { email: String(email || "").trim(), password: String(password || "") }
    });
    if (!user?.accessToken) {
      throw new ApiError("TOKEN_MISSING", "The backend did not return an access token.", 502);
    }
    saveAccessToken(user.accessToken);
    return { data: user, meta: { source: "orchestrator" } };
  },

  async register(input) {
    const name = splitName(input?.name || `${input?.firstName || ""} ${input?.lastName || ""}`);
    const user = await request("/api/auth/register", {
      method: "POST",
      body: {
        ...name,
        email: String(input?.email || "").trim(),
        phoneNo: String(input?.phoneNo || "").replace(/\D/g, ""),
        password: String(input?.password || "")
      }
    });
    return { data: user, meta: { source: "orchestrator" } };
  },

  async getMe() {
    if (!getAccessToken()) {
      throw new ApiError("UNAUTHENTICATED", "Please sign in to continue.", 401);
    }
    const user = await request("/user/me", { authenticated: true });
    return { data: user, meta: { source: "orchestrator" } };
  },

  async recover() {
    throw new ApiError("RECOVERY_UNAVAILABLE", "Password recovery is not available yet. Contact the administrator.", 501);
  },

  logout() {
    clearAccessToken();
  }
};
