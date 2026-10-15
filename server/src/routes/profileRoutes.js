import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Get portfolio profile
router.get("/", getProfile);

// Admin: Update portfolio profile
router.put("/", requireAuth, updateProfile);

export default router;
