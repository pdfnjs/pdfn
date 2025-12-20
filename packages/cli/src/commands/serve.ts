import { Command } from "commander";
import { createServer } from "../server/index";
import { logger } from "../utils/logger";

export const serveCommand = new Command("serve")
  .description("Start production server (headless, no UI)")
  .option("--port <number>", "Server port (env: PDFX_PORT)", "3456")
  .option("--max-concurrent <number>", "Max concurrent pages (env: PDFX_MAX_CONCURRENT)", "5")
  .option("--timeout <ms>", "Request timeout in ms (env: PDFX_TIMEOUT)", "30000")
  .action(async (options) => {
    const port = parseInt(options.port, 10);
    const maxConcurrent = parseInt(options.maxConcurrent, 10);
    const timeout = parseInt(options.timeout, 10);

    const server = createServer({ port, maxConcurrent, timeout });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.shutdown();
      await server.stop();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    await server.start();
  });
