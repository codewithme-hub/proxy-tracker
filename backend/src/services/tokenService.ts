import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { env } from "../config/env.js";
import { User, type IUser } from "../models/User.js";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
}

export function signAccessToken(user: IUser): string {
  const payload: AccessTokenPayload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl as any });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

/**
 * Issues a new refresh token, stores it on the user doc (hashed-free, opaque random
 * string keyed by id — simplest safe approach for a small app), and prunes expired ones.
 */
export async function issueRefreshToken(user: IUser): Promise<string> {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

  await User.updateOne(
    { _id: user._id },
    {
      $push: { refreshTokens: { token, createdAt: new Date(), expiresAt } },
    }
  );

  // Best-effort prune of expired tokens (not awaited-critical, fire and forget is fine here
  // but we await to keep behavior deterministic in tests).
  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );

  return token;
}

/**
 * Rotates a refresh token: validates it belongs to a user and hasn't expired,
 * removes it, and issues a brand new one. Returns null if invalid (caller should
 * treat as "must log in again").
 */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string } | null> {
  const user = await User.findOne({ "refreshTokens.token": oldToken }).select("+refreshTokens");
  if (!user) return null;

  const stored = user.refreshTokens.find((rt) => rt.token === oldToken);
  if (!stored || stored.expiresAt < new Date()) {
    // Expired or not found — remove it if present and reject.
    await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: { token: oldToken } } });
    return null;
  }

  // Remove old, issue new (rotation).
  await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: { token: oldToken } } });
  const refreshToken = await issueRefreshToken(user);
  const accessToken = signAccessToken(user);

  return { user, accessToken, refreshToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await User.updateOne({ "refreshTokens.token": token }, { $pull: { refreshTokens: { token } } });
}
