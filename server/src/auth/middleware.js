import { getSessionAccount } from "./service.js";

export const SESSION_COOKIE = "peoplespace_session";

export function readCookie(request, name) {
  const cookies = String(request.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function requireAuth(request, response, next) {
  const account = getSessionAccount(readCookie(request, SESSION_COOKIE));
  if (!account)
    return response
      .status(401)
      .json({ message: "Please sign in to continue." });
  request.account = account;
  next();
}
