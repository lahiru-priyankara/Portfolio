import { Router } from "express";
import {
  submitMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messagesController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public: Submit a contact message
router.post("/", submitMessage);

// Admin: View all messages, update status, delete
router.get("/", requireAuth, getMessages);
router.patch("/:id/status", requireAuth, updateMessageStatus);
router.delete("/:id", requireAuth, deleteMessage);

export default router;
