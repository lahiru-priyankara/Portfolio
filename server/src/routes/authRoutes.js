import { Router } from "express";
import { login, getMe, logout, refreshToken } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);

export default router;
