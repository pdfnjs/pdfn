import { Command } from "commander";

export const addCommand = new Command("add")
  .description("Add a starter template to your project")
  .argument("[template]", "Template name (e.g., invoice, receipt, report)")
  .option("--list", "List available templates")
  .option("--output <path>", "Output directory", "./pdf-templates")
  .action(async (template, options) => {
    if (options.list) {
      console.log("Available templates:");
      console.log("  - invoice    Basic invoice template");
      console.log("  - receipt    Simple receipt template");
      console.log("  - report     Multi-page report template");
      return;
    }

    if (!template) {
      console.log("Usage: pdfx add <template>");
      console.log("Run 'pdfx add --list' to see available templates");
      return;
    }

    console.log(`Adding template: ${template}`);
    console.log(`Output directory: ${options.output}`);

    // TODO: Phase 5 - Implement template scaffolding
    console.log("\nTemplate scaffolding not yet implemented (Phase 5)");
  });
