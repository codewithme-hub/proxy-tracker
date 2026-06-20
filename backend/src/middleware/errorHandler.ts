import type { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ message: "Something went wrong on our end" });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}
