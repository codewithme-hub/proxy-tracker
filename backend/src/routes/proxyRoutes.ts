import { Router } from "express";
import * as proxyController from "../controllers/proxyController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireGroupMember } from "../middleware/requireGroupMember.js";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGroupMember);

router.post("/", proxyController.createEntry);
router.get("/balances", proxyController.getBalances);
router.get("/activity", proxyController.getActivity);
router.get("/", proxyController.listEntries);
router.delete("/:entryId", proxyController.deleteEntry);

export default router;
