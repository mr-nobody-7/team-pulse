import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { listTeamsController } from "../controllers/team.controller.js";

const router = Router();

router.get("/", authenticate, listTeamsController);

export { router as teamRoutes };
