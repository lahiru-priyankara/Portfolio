import { Router } from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  syncProjectGithub,
  handleGithubWebhook,
  togglePublishProject,
} from "../controllers/projectsController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Get all projects (or ?all=true for admin)
router.get("/", getProjects);

// GitHub Webhook for instant sync on git commit push
router.post("/github-webhook", handleGithubWebhook);
router.post("/:id/github-webhook", handleGithubWebhook);

// Admin: CRUD operations & GitHub sync
router.post("/", requireAuth, createProject);
router.put("/:id", requireAuth, updateProject);
router.patch("/:id/publish", requireAuth, togglePublishProject);
router.delete("/:id", requireAuth, deleteProject);
router.post("/:id/github-sync", requireAuth, syncProjectGithub);

export default router;
