import { Router } from "express";
import * as groupController from "../controllers/groupController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireGroupMember } from "../middleware/requireGroupMember.js";

const router = Router();

router.use(requireAuth);

router.post("/", groupController.createGroup);
router.post("/join", groupController.joinGroup);
router.get("/", groupController.getMyGroups);
router.get("/:groupId", requireGroupMember, groupController.getGroup);
router.post("/:groupId/activate", requireGroupMember, groupController.setActiveGroup);
router.post("/:groupId/leave", requireGroupMember, groupController.leaveGroup);

export default router;
