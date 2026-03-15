import { Router } from "express";

import {
  createUserController,
  deactivateUserController,
  listUsersController,
  updateUserController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../utils/validations.js";

const router = Router();

router.get("/", authenticate, authorize(["ADMIN"]), listUsersController);
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate(createUserSchema),
  createUserController,
);
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateUserSchema),
  updateUserController,
);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(["ADMIN"]),
  deactivateUserController,
);

export { router as userRoutes };
