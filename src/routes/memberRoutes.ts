import { Router } from "express";
import {
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/memberController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/:workspaceId/members", addMember);
router.delete("/:workspaceId/members/:userId", removeMember);
router.put("/:workspaceId/members/:userId", updateMemberRole);

export default router;
