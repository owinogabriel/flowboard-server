import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import requireAuth from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/projectSchema.js";

const router = Router();
router.use(requireAuth);

router.get("/workspace/:workspaceId", getProjects);
router.get("/:id", getProjectById);
router.post(
  "/workspace/:workspaceId",
  validate(createProjectSchema),
  createProject,
);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);

export default router;
