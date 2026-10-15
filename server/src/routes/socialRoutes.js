import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  toggleStatusSocialLink,
  deleteSocialLink,
} from "../controllers/socialController.js";

const router = Router();

// Public: Get all active social links (or ?all=true for admin)
router.get("/", getSocialLinks);

// Protected Admin Actions
router.post("/", requireAuth, createSocialLink);
router.put("/:id", requireAuth, updateSocialLink);
router.patch("/:id/status", requireAuth, toggleStatusSocialLink);
router.delete("/:id", requireAuth, deleteSocialLink);

export default router;
