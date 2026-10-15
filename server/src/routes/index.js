import { Router } from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import projectRoutes from "./projectRoutes.js";
import skillRoutes from "./skillRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import messageRoutes from "./messageRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import socialRoutes from "./socialRoutes.js";
import systemRoutes from "./systemRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/profile", profileRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/skills", skillRoutes);
apiRouter.use("/services", serviceRoutes);
apiRouter.use("/messages", messageRoutes);
apiRouter.use("/social-links", socialRoutes);
apiRouter.use("/social", socialRoutes);
apiRouter.use("/system", systemRoutes);

export default apiRouter;
