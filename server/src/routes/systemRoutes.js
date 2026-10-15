import { Router } from "express";
import { getSystemHealth } from "../controllers/systemController.js";

const router = Router();

// GET /api/system/health - Real-time system health and analytics telemetry
router.get("/health", getSystemHealth);

export default router;
