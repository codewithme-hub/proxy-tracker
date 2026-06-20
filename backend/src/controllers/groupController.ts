import type { Response } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import type { GroupScopedRequest } from "../middleware/requireGroupMember.js";

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(4).max(20),
});

function publicGroup(group: any) {
  return {
    id: group._id.toString(),
    name: group.name,
    inviteCode: group.inviteCode,
    maxMembers: group.maxMembers,
    members: group.members.map((m: any) => ({
      userId: m.user._id ? m.user._id.toString() : m.user.toString(),
      name: m.user.name ?? undefined,
      avatarUrl: m.user.avatarUrl ?? undefined,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    createdAt: group.createdAt,
  };
}

export async function createGroup(req: AuthedRequest, res: Response) {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  const inviteCode = nanoid(8).toUpperCase();

  const group = await Group.create({
    name: parsed.data.name,
    inviteCode,
    createdBy: req.userId,
    members: [{ user: req.userId, role: "admin", joinedAt: new Date() }],
  });

  await User.updateOne({ _id: req.userId }, { activeGroup: group._id });

  res.status(201).json({ group: publicGroup(group) });
}

export async function joinGroup(req: AuthedRequest, res: Response) {
  const parsed = joinGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  const group = await Group.findOne({ inviteCode: parsed.data.inviteCode.toUpperCase() });
  if (!group) {
    return res.status(404).json({ message: "Invalid invite code" });
  }

  const alreadyMember = group.members.some((m) => m.user.toString() === req.userId);
  if (alreadyMember) {
    await User.updateOne({ _id: req.userId }, { activeGroup: group._id });
    return res.json({ group: publicGroup(group) });
  }

  if (group.members.length >= group.maxMembers) {
    return res.status(400).json({ message: `This group is full (max ${group.maxMembers} members)` });
  }

  group.members.push({ user: req.userId as any, role: "member", joinedAt: new Date() });
  await group.save();
  await User.updateOne({ _id: req.userId }, { activeGroup: group._id });

  res.json({ group: publicGroup(group) });
}

export async function getMyGroups(req: AuthedRequest, res: Response) {
  const groups = await Group.find({ "members.user": req.userId }).populate(
    "members.user",
    "name avatarUrl"
  );
  res.json({ groups: groups.map(publicGroup) });
}

export async function getGroup(req: GroupScopedRequest, res: Response) {
  const group = await req.group!.populate("members.user", "name avatarUrl");
  res.json({ group: publicGroup(group) });
}

export async function setActiveGroup(req: GroupScopedRequest, res: Response) {
  await User.updateOne({ _id: req.userId }, { activeGroup: req.group!._id });
  res.json({ message: "Active group updated" });
}

export async function leaveGroup(req: GroupScopedRequest, res: Response) {
  const group = req.group!;
  const isLastAdmin =
    req.groupRole === "admin" && group.members.filter((m) => m.role === "admin").length === 1;

  if (isLastAdmin && group.members.length > 1) {
    return res.status(400).json({
      message: "You're the only admin. Promote another member to admin before leaving.",
    });
  }

  group.members = group.members.filter((m) => m.user.toString() !== req.userId) as any;

  if (group.members.length === 0) {
    await Group.deleteOne({ _id: group._id });
  } else {
    await group.save();
  }

  await User.updateOne({ _id: req.userId, activeGroup: group._id }, { activeGroup: null });

  res.json({ message: "Left group" });
}
