import { Command } from "commander";

export const devCommand = new Command("dev")
  .description("Start development server with template preview")
  .option("--port <number>", "Server port", "3456")
  .option("--templates <path>", "Templates directory", "./pdf-templates")
  .option("--no-open", "Don't open browser automatically")
  .action(async (options) => {
    console.log("PDFX dev server starting...");
    console.log(`Port: ${options.port}`);
    console.log(`Templates: ${options.templates}`);
    console.log(`Open browser: ${options.open}`);

    // TODO: Phase 5 - Implement dev server
    console.log("\nDev server not yet implemented (Phase 5)");
  });
