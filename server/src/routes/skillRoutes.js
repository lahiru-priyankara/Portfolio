import { Router } from "express";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillsController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Get all skills
router.get("/", getSkills);

// Admin: CRUD operations
router.post("/", requireAuth, createSkill);
router.put("/:id", requireAuth, updateSkill);
router.delete("/:id", requireAuth, deleteSkill);

export default router;
