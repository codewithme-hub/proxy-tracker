import type { Response, NextFunction } from "express";
import { Group } from "../models/Group.js";
import type { AuthedRequest } from "./requireAuth.js";

export interface GroupScopedRequest extends AuthedRequest {
  group?: InstanceType<typeof Group>;
  groupRole?: "admin" | "member";
}

/**
 * Loads the group from :groupId (or req.body.groupId) and ensures req.userId
 * is a member. Attaches the group doc + role to the request for downstream handlers.
 */
export async function requireGroupMember(
  req: GroupScopedRequest,
  res: Response,
  next: NextFunction
) {
  const groupId = req.params.groupId ?? req.body.groupId;
  if (!groupId) {
    return res.status(400).json({ message: "groupId is required" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  const membership = group.members.find((m) => m.user.toString() === req.userId);
  if (!membership) {
    return res.status(403).json({ message: "You are not a member of this group" });
  }

  req.group = group;
  req.groupRole = membership.role;
  next();
}

export function requireGroupAdmin(req: GroupScopedRequest, res: Response, next: NextFunction) {
  if (req.groupRole !== "admin") {
    return res.status(403).json({ message: "Only a group admin can do this" });
  }
  next();
}
