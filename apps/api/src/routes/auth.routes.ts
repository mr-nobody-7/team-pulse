
import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../utils/validations.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

export { router as authRoutes };
