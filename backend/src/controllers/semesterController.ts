import type { Response } from "express";
import { z } from "zod";
import { Semester } from "../models/Semester.js";
import type { GroupScopedRequest } from "../middleware/requireGroupMember.js";

const createSemesterSchema = z.object({
  name: z.string().trim().min(1).max(40),
  subjects: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  makeActive: z.boolean().optional(),
});

const updateSemesterSchema = createSemesterSchema.partial();

function publicSemester(s: any) {
  return {
    id: s._id.toString(),
    name: s.name,
    subjects: s.subjects,
    isActive: s.isActive,
    startDate: s.startDate,
    endDate: s.endDate,
  };
}

export async function createSemester(req: GroupScopedRequest, res: Response) {
  const parsed = createSemesterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }
  const { name, subjects, startDate, endDate, makeActive } = parsed.data;

  if (makeActive) {
    await Semester.updateMany({ group: req.group!._id }, { isActive: false });
  }

  const semester = await Semester.create({
    group: req.group!._id,
    name,
    subjects: subjects ?? [],
    startDate,
    endDate,
    isActive: makeActive ?? false,
  });

  res.status(201).json({ semester: publicSemester(semester) });
}

export async function listSemesters(req: GroupScopedRequest, res: Response) {
  const semesters = await Semester.find({ group: req.group!._id }).sort({ createdAt: -1 });
  res.json({ semesters: semesters.map(publicSemester) });
}

export async function updateSemester(req: GroupScopedRequest, res: Response) {
  const parsed = updateSemesterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  const semester = await Semester.findOne({ _id: req.params.semesterId, group: req.group!._id });
  if (!semester) return res.status(404).json({ message: "Semester not found" });

  if (parsed.data.makeActive) {
    await Semester.updateMany({ group: req.group!._id }, { isActive: false });
    semester.isActive = true;
  }

  Object.assign(semester, {
    name: parsed.data.name ?? semester.name,
    subjects: parsed.data.subjects ?? semester.subjects,
    startDate: parsed.data.startDate ?? semester.startDate,
    endDate: parsed.data.endDate ?? semester.endDate,
  });

  await semester.save();
  res.json({ semester: publicSemester(semester) });
}

export async function deleteSemester(req: GroupScopedRequest, res: Response) {
  const semester = await Semester.findOneAndDelete({
    _id: req.params.semesterId,
    group: req.group!._id,
  });
  if (!semester) return res.status(404).json({ message: "Semester not found" });
  res.json({ message: "Semester deleted" });
}
