import { Router } from "express";

import { listPublicHolidaysController } from "../controllers/holiday.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, listPublicHolidaysController);

export { router as holidayRoutes };
