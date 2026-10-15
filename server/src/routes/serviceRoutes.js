import { Router } from "express";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  togglePublishService,
} from "../controllers/servicesController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Get all services (or ?all=true for admin)
router.get("/", getServices);

// Admin: CRUD operations
router.post("/", requireAuth, createService);
router.put("/:id", requireAuth, updateService);
router.patch("/:id/publish", requireAuth, togglePublishService);
router.delete("/:id", requireAuth, deleteService);

export default router;
