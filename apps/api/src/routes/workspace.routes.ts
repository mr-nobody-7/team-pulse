import { Router } from "express";
import {
  listWorkspaceMembersController,
  transferWorkspaceOwnershipController,
} from "../controllers/workspace.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { transferOwnershipSchema } from "../utils/validations.js";

const router = Router();

router.get(
  "/:workspaceId/members",
  authenticate,
  authorize(["ADMIN"]),
  listWorkspaceMembersController,
);
router.patch(
  "/:workspaceId/transfer-ownership",
  authenticate,
  authorize(["OWNER"]),
  validate(transferOwnershipSchema),
  transferWorkspaceOwnershipController,
);

export { router as workspaceRoutes };
