import { validateEnv } from "./lib/env";
import { logger } from "./lib/logger";

// Validate all env vars before anything else boots
const env = validateEnv();

// Now import app (which uses process.env internally)
import app from "./app";
import { pool } from "@workspace/db";

// ---------------------------------------------------------------------------
// Unhandled rejection / uncaught exception guards
// ---------------------------------------------------------------------------
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server listening");
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutdown signal received, closing gracefully...");

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error closing HTTP server");
      process.exit(1);
    }

    try {
      await pool.end();
      logger.info("Database pool closed.");
    } catch (dbErr) {
      logger.error({ dbErr }, "Error closing database pool");
    }

    logger.info("Graceful shutdown complete.");
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown stalls
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
