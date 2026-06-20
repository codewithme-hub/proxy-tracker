import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/tokenService.js";
import { env } from "../config/env.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";

const REFRESH_COOKIE = "ptr_refresh";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function publicUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    activeGroup: user.activeGroup ?? null,
  };
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user: publicUser(user), accessToken });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.json({ user: publicUser(user), accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const result = await rotateRefreshToken(token);
  if (!result) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return res.status(401).json({ message: "Session expired, please log in again" });
  }

  setRefreshCookie(res, result.refreshToken);
  res.json({ user: publicUser(result.user), accessToken: result.accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await revokeRefreshToken(token);
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ message: "Logged out" });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
}

/**
 * Called after passport's Google strategy succeeds (req.user is set).
 * Issues our own JWT pair and redirects back to the frontend with the
 * access token in the URL fragment (refresh token goes in an httpOnly cookie).
 */
export async function googleCallback(req: Request, res: Response) {
  const user = req.user as any;
  if (!user) {
    return res.redirect(`${env.clientUrl}/login?error=google_auth_failed`);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.redirect(`${env.clientUrl}/auth/callback#token=${accessToken}`);
}
