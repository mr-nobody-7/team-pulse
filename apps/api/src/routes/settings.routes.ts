import { Router } from "express";

import {
  getLeaveTypesSettingsController,
  updateLeaveTypesSettingsController,
} from "../controllers/settings.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { updateLeaveTypesSchema } from "../utils/validations.js";

const router = Router();

router.get("/leave-types", authenticate, getLeaveTypesSettingsController);
router.put(
  "/leave-types",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateLeaveTypesSchema),
  updateLeaveTypesSettingsController,
);

export { router as settingsRoutes };
