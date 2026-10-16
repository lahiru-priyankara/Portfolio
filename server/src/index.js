import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// URL normalization for Vercel Serverless Function rewrites & reverse proxies
// Must run FIRST before any routing or parsing
app.use((req, _res, next) => {
  // 1. Check for real request URI in forwarding/proxy headers
  const forwardedUri =
    req.headers["x-forwarded-uri"] ||
    req.headers["x-original-url"] ||
    req.headers["x-rewrite-url"];

  if (forwardedUri && !forwardedUri.includes("/index.js") && !forwardedUri.includes("/api/index")) {
    req.url = forwardedUri;
    return next();
  }

  // 2. Check for Vercel rewrite regex match in query (?0=... or req.query['0'])
  // From vercel.json: { "source": "/api/(.*)", "destination": "/api/index.js" }
  let subpath = null;
  const parsedUrl = new URL(req.url, "http://localhost");
  const query0 = req.query?.["0"] || req.query?.[0] || parsedUrl.searchParams.get("0");

  if (query0) {
    subpath = query0;
    if (req.query) {
      delete req.query["0"];
      delete req.query[0];
    }
    parsedUrl.searchParams.delete("0");
  }

  if (subpath) {
    const cleanSub = subpath.startsWith("/") ? subpath : `/${subpath}`;
    const search = parsedUrl.searchParams.toString();
    req.url = `/api${cleanSub}${search ? `?${search}` : ""}`;
    return next();
  }

  // 3. Fallback: if req.url starts with /api/index.js or /index.js, strip the index.js portion
  if (req.url.startsWith("/api/index.js") || req.url.startsWith("/api/index")) {
    const afterIndex = req.url.replace(/^\/api\/index(\.js)?/, "");
    req.url = afterIndex ? `/api${afterIndex.startsWith("/") ? afterIndex : `/${afterIndex}`}` : "/api";
  } else if (req.url.startsWith("/index.js") || req.url.startsWith("/index")) {
    const afterIndex = req.url.replace(/^\/index(\.js)?/, "");
    req.url = afterIndex ? (afterIndex.startsWith("/") ? afterIndex : `/${afterIndex}`) : "/";
  }

  next();
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin === CLIENT_URL || origin.includes("localhost")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in production
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Health Check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "portfolio-backend",
  });
});

// API Routes (mounted under both /api and root / to support direct Express calls and Vercel serverless rewrites)
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Serve frontend static assets if dist/ exists (single-server deployment mode)
const distPath = path.resolve(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// 404 Handler (for unmatched API routes or missing assets)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server (only when not running inside Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Portfolio Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
}

export default app;
