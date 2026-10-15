import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Get system settings & intro customization
router.get("/", getSettings);

// Admin: Update system settings & intro customization
router.put("/", requireAuth, updateSettings);

export default router;
