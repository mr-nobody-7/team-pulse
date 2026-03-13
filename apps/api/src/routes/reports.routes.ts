import { Router } from "express";

import { getSummaryController } from "../controllers/reports.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/summary", authenticate, getSummaryController);

export { router as reportsRoutes };
