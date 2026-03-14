import { Router } from "express";

import {
	getAnalyticsController,
	getSummaryController,
} from "../controllers/reports.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/summary", authenticate, getSummaryController);
router.get("/analytics", authenticate, getAnalyticsController);

export { router as reportsRoutes };
