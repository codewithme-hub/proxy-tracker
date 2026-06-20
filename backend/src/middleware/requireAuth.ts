import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/tokenService.js";
import { User } from "../models/User.js";

export interface AuthedRequest extends Request {
  userId?: string;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = verifyAccessToken(token);
    // Cheap existence check so a deleted user can't keep using a still-valid token.
    const exists = await User.exists({ _id: payload.sub });
    if (!exists) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
