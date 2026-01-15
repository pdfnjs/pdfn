import { Command } from "commander";
import { execSync, spawn, type ChildProcess } from "child_process";
import chalk from "chalk";
import { loadEnv } from "../utils/env";

const CONTAINER_NAME = "pdfn-server";
const GOTENBERG_IMAGE = "gotenberg/gotenberg:8";
const DEFAULT_PORT = 3456;

/**
 * Check if Docker is available
 */
function hasDocker(): boolean {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a container with the given name is running
 */
function isContainerRunning(name: string): boolean {
  try {
    const result = execSync(`docker ps --filter "name=${name}" --format "{{.Names}}"`, {
      encoding: "utf-8",
    });
    return result.trim() === name;
  } catch {
    return false;
  }
}

/**
 * Stop and remove a container
 */
function stopContainer(name: string): void {
  try {
    execSync(`docker stop ${name}`, { stdio: "ignore" });
  } catch {
    // Container not running, ignore
  }
  try {
    execSync(`docker rm ${name}`, { stdio: "ignore" });
  } catch {
    // Container doesn't exist, ignore
  }
}

/**
 * Check if server is healthy
 */
async function isServerHealthy(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for server to be healthy
 */
async function waitForHealthy(port: number, timeoutMs = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerHealthy(port)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

export const serveCommand = new Command("serve")
  .description("Start production PDF server (powered by Gotenberg)")
  .option("--port <number>", "Server port (env: PDFN_PORT)", String(DEFAULT_PORT))
  .option("--mode <mode>", "Environment mode (loads .env.[mode])", "production")
  .action(async (options) => {
    // Load environment variables based on mode
    loadEnv(options.mode);

    const port = parseInt(process.env.PDFN_PORT ?? options.port, 10);

    console.log();

    // Check if server is already running on this port
    if (await isServerHealthy(port)) {
      console.log(chalk.green("  ✓"), `Server already running on port ${port}`);
      console.log(chalk.dim(`    http://localhost:${port}`));
      console.log();
      console.log(chalk.dim("  Press Ctrl+C to exit"));

      // Keep process alive
      await new Promise(() => {});
      return;
    }

    // Check Docker availability
    if (!hasDocker()) {
      console.log(chalk.red("  ✗"), "Docker not found");
      console.log();
      console.log(chalk.dim("  pdfn serve requires Docker to run Gotenberg."));
      console.log(chalk.dim("  Install Docker: https://docs.docker.com/get-docker/"));
      console.log();
      console.log(chalk.dim("  Alternatively, start Gotenberg manually:"));
      console.log(chalk.dim(`    docker run -p ${port}:3000 ${GOTENBERG_IMAGE}`));
      console.log();
      process.exit(1);
    }

    // Stop existing container if any
    if (isContainerRunning(CONTAINER_NAME)) {
      console.log(chalk.dim("  Stopping existing container..."));
      stopContainer(CONTAINER_NAME);
    }

    // Start Gotenberg container
    console.log(chalk.dim(`  Starting Gotenberg on port ${port}...`));

    let dockerProcess: ChildProcess;
    try {
      dockerProcess = spawn(
        "docker",
        [
          "run",
          "--rm",
          "--name",
          CONTAINER_NAME,
          "-p",
          `${port}:3000`,
          GOTENBERG_IMAGE,
        ],
        { stdio: "inherit" }
      );
    } catch (error) {
      console.log(chalk.red("  ✗"), "Failed to start Docker container");
      console.error(chalk.dim("   "), error);
      process.exit(1);
    }

    // Handle Docker process errors
    dockerProcess.on("error", (err) => {
      console.log(chalk.red("  ✗"), "Docker process error:", err.message);
      process.exit(1);
    });

    dockerProcess.on("exit", (code) => {
      if (code !== null && code !== 0) {
        console.log(chalk.red("  ✗"), `Docker exited with code ${code}`);
        process.exit(1);
      }
    });

    // Wait for server to be healthy
    const healthy = await waitForHealthy(port);

    if (!healthy) {
      console.log(chalk.red("  ✗"), "Server failed to start (timeout)");
      stopContainer(CONTAINER_NAME);
      process.exit(1);
    }

    console.log(chalk.green("  ✓"), `Ready at ${chalk.cyan(`http://localhost:${port}`)}`);
    console.log();

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log();
      console.log(chalk.dim("  Stopping server..."));
      stopContainer(CONTAINER_NAME);
      console.log(chalk.green("  ✓"), "Server stopped");
      console.log();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    // Keep process alive
    await new Promise(() => {});
  });
