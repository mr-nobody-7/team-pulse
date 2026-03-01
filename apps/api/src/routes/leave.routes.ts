import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { applyLeaveController } from "../controllers/leave.controller.js";
import { validate } from "../middleware/validate.js";
import { applyLeaveSchema } from "../utils/validations.js";

const router = Router();

router.post(
  "/applyLeave",
  authenticate,
  authorize(["MANAGER", "USER"]),
  validate(applyLeaveSchema),
  applyLeaveController,
);

export { router as leaveRoutes };
