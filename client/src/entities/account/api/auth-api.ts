import { apiGet, apiRequest } from "@/shared/api/client";

import type { SessionResponse } from "../model/types";

export function fetchSession(signal?: AbortSignal): Promise<SessionResponse> {
  return apiGet<SessionResponse>("/api/auth/session", signal);
}

export function login(
  email: string,
  password: string,
): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
  });
}
