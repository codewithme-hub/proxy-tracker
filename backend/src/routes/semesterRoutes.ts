import { Router } from "express";
import * as semesterController from "../controllers/semesterController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireGroupMember } from "../middleware/requireGroupMember.js";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGroupMember);

router.post("/", semesterController.createSemester);
router.get("/", semesterController.listSemesters);
router.patch("/:semesterId", semesterController.updateSemester);
router.delete("/:semesterId", semesterController.deleteSemester);

export default router;
