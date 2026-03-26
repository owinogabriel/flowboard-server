import { Router } from "express";
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  deleteWorkspace,
  updateWorksapce,
} from "../controllers/workspaceController.js";
import requireAuth from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "../schemas/workspaceSchema.js";

const router = Router();
router.use(requireAuth)

router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);
router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.put("/:id", validate(updateWorkspaceSchema), updateWorksapce);
router.delete("/:id", deleteWorkspace);

export default router;
