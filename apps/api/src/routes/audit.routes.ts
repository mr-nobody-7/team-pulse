import { Router } from "express";

import { listAuditLogsController } from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize(["ADMIN"]), listAuditLogsController);

export { router as auditRoutes };
