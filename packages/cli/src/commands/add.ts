import { Command } from "commander";
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Available templates with descriptions
const TEMPLATES: Record<string, { name: string; description: string; pageSize: string }> = {
  invoice: {
    name: "Invoice",
    description: "Professional invoice with itemized billing",
    pageSize: "A4",
  },
  letter: {
    name: "Business Letter",
    description: "US business correspondence",
    pageSize: "Letter",
  },
  contract: {
    name: "Contract",
    description: "Legal service agreement with terms",
    pageSize: "Legal",
  },
  ticket: {
    name: "Event Ticket",
    description: "Admission ticket with QR placeholder",
    pageSize: "A5",
  },
  poster: {
    name: "Poster",
    description: "Event poster (landscape)",
    pageSize: "Tabloid",
  },
};

function getTemplatesDir(): string {
  // After build, cli.js is in dist/, templates are in templates/
  // So from dist/ we go up one level to package root, then into templates/
  return join(__dirname, "..", "templates");
}

export const addCommand = new Command("add")
  .description("Add a starter template to your project")
  .argument("[template]", "Template name (e.g., invoice, letter, contract)")
  .option("--list", "List available templates")
  .option("--output <path>", "Output directory", "./pdf-templates")
  .option("--force", "Overwrite existing files")
  .action(async (template, options) => {
    // List templates
    if (options.list || !template) {
      console.log(chalk.bold("\nAvailable templates:\n"));

      for (const [id, info] of Object.entries(TEMPLATES)) {
        console.log(`  ${chalk.cyan(id.padEnd(12))} ${info.description} ${chalk.dim(`(${info.pageSize})`)}`);
      }

      console.log(chalk.dim("\nUsage: pdfx add <template>"));
      console.log(chalk.dim("Example: pdfx add invoice\n"));
      return;
    }

    // Validate template
    if (!TEMPLATES[template]) {
      console.error(chalk.red(`\nError: Unknown template "${template}"`));
      console.log(chalk.dim("Run 'pdfx add --list' to see available templates\n"));
      process.exit(1);
    }

    const templatesDir = getTemplatesDir();
    const sourceFile = join(templatesDir, `${template}.tsx`);
    const outputDir = options.output;
    const outputFile = join(outputDir, `${template}.tsx`);

    // Check if source template exists
    if (!existsSync(sourceFile)) {
      console.error(chalk.red(`\nError: Template file not found: ${sourceFile}`));
      console.log(chalk.dim("This may be a package installation issue.\n"));
      process.exit(1);
    }

    // Create output directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      console.log(chalk.dim(`Created ${outputDir}/`));
    }

    // Check if file already exists
    if (existsSync(outputFile) && !options.force) {
      console.error(chalk.yellow(`\nFile already exists: ${outputFile}`));
      console.log(chalk.dim("Use --force to overwrite\n"));
      process.exit(1);
    }

    // Copy template
    try {
      copyFileSync(sourceFile, outputFile);

      const info = TEMPLATES[template];
      console.log(chalk.green(`\n✓ Added ${info.name} template`));
      console.log(chalk.dim(`  ${outputFile}\n`));

      // Show next steps
      console.log(chalk.bold("Next steps:"));
      console.log(chalk.dim(`  1. Edit ${outputFile} to customize`));
      console.log(chalk.dim(`  2. Run 'npx @pdfx-dev/cli dev' to preview\n`));
    } catch (error) {
      console.error(chalk.red(`\nError copying template: ${error}`));
      process.exit(1);
    }
  });

// Also export the template info for use by dev server
export { TEMPLATES };
