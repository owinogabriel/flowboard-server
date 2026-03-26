import { Router } from "express";
import { loginSchema, registerSchema } from "../schemas/authSchema.js";
import { login, register, getMe, updateProfile } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateProfile);

export default router;
