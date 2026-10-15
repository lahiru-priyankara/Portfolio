/**
 * Centralized error handling middleware
 */
export function errorHandler(err, req, res, _next) {
  console.error("[Server Error]", err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
