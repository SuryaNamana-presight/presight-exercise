import { Router } from "express";
import { SESSION_COOKIE, readCookie, requireAuth } from "./middleware.js";
import { authenticate, createSession, destroySession } from "./service.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true",
  path: "/",
};

export const authRouter = Router();

authRouter.post("/login", (request, response) => {
  const email =
    typeof request.body?.email === "string"
      ? request.body.email.slice(0, 254)
      : "";
  const password =
    typeof request.body?.password === "string"
      ? request.body.password.slice(0, 200)
      : "";
  if (!email || !password) {
    return response
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const account = authenticate(email, password);

  if (!account) {
    return response
      .status(401)
      .json({ message: "The email or password is incorrect." });
  }

  const session = createSession(account.id);
  response.cookie(SESSION_COOKIE, session.token, {
    ...cookieOptions,
    expires: new Date(session.expiresAt),
  });
  response.json({ account });
});

authRouter.get("/session", requireAuth, (request, response) =>
  response.json({ account: request.account }),
);

authRouter.post("/logout", (request, response) => {
  destroySession(readCookie(request, SESSION_COOKIE));
  response.clearCookie(SESSION_COOKIE, cookieOptions);
  response.status(204).end();
});
