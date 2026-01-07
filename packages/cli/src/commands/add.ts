import { Command } from "commander";
import { existsSync, mkdirSync, copyFileSync, readFileSync } from "fs";
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

type TemplateStyle = "inline" | "tailwind";

function getTemplatesDir(style: TemplateStyle): string {
  // After build, cli.js is in dist/, templates are in templates/
  // So from dist/ we go up one level to package root, then into templates/<style>/
  return join(__dirname, "..", "templates", style);
}

/**
 * Check if @pdfn/tailwind is installed in user's project
 * Checks both package.json and node_modules for compatibility with npm, pnpm, yarn
 */
function isTailwindInstalled(cwd: string): boolean {
  // First check package.json for explicit dependency
  try {
    const pkgPath = join(cwd, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.dependencies?.["@pdfn/tailwind"] || pkg.devDependencies?.["@pdfn/tailwind"]) {
        return true;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Fall back to checking node_modules (for linked packages, global installs, etc.)
  const tailwindPath = join(cwd, "node_modules", "@pdfn", "tailwind");
  return existsSync(tailwindPath);
}

export const addCommand = new Command("add")
  .description("Add a starter template to your project")
  .argument("[template]", "Template name (e.g., invoice, letter, contract)")
  .option("--list", "List available templates")
  .option("--tailwind", "Use Tailwind CSS styling (requires @pdfn/tailwind)")
  .option("--inline", "Use inline styles (default)")
  .option("--output <path>", "Output directory", "./pdf-templates")
  .option("--force", "Overwrite existing files")
  .action(async (template, options) => {
    const cwd = process.cwd();

    // List templates
    if (options.list || !template) {
      console.log(chalk.bold("\nAvailable templates:\n"));

      for (const [id, info] of Object.entries(TEMPLATES)) {
        console.log(`  ${chalk.cyan(id.padEnd(12))} ${info.description} ${chalk.dim(`(${info.pageSize})`)}`);
      }

      console.log(chalk.dim("\nUsage: pdfn add <template> [--tailwind]"));
      console.log(chalk.dim("Example: pdfn add invoice"));
      console.log(chalk.dim("Example: pdfn add invoice --tailwind\n"));
      console.log(chalk.bold("Options:"));
      console.log(chalk.dim("  --inline     Use inline styles (default)"));
      console.log(chalk.dim("  --tailwind   Use Tailwind CSS (requires @pdfn/tailwind)\n"));
      return;
    }

    // Validate template
    if (!TEMPLATES[template]) {
      console.error(chalk.red(`\nError: Unknown template "${template}"`));
      console.log(chalk.dim("Run 'pdfn add --list' to see available templates\n"));
      process.exit(1);
    }

    // Determine style (default to inline)
    const style: TemplateStyle = options.tailwind ? "tailwind" : "inline";

    // Check for @pdfn/tailwind if tailwind style requested
    if (style === "tailwind" && !isTailwindInstalled(cwd)) {
      console.error(chalk.yellow(`\n⚠ @pdfn/tailwind is not installed.`));
      console.log(chalk.dim("Install it first to use Tailwind templates:\n"));
      console.log(chalk.cyan("  npm install @pdfn/tailwind\n"));
      console.log(chalk.dim("Or use inline styles (default):\n"));
      console.log(chalk.cyan(`  pdfn add ${template}\n`));
      process.exit(1);
    }

    const templatesDir = getTemplatesDir(style);
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
      const styleLabel = style === "tailwind" ? chalk.cyan(" (Tailwind)") : chalk.dim(" (inline styles)");
      console.log(chalk.green(`\n✓ Added ${info.name} template`) + styleLabel);
      console.log(chalk.dim(`  ${outputFile}\n`));

      // Show next steps
      console.log(chalk.bold("Next steps:"));
      console.log(chalk.dim(`  1. Edit ${outputFile} to customize`));
      console.log(chalk.dim(`  2. Run 'npx pdfn dev' to preview\n`));

      // Additional info for tailwind
      if (style === "tailwind") {
        console.log(chalk.dim("Note: Tailwind templates require @pdfn/tailwind to be installed.\n"));
      }
    } catch (error) {
      console.error(chalk.red(`\nError copying template: ${error}`));
      process.exit(1);
    }
  });

// Also export the template info for use by dev server
export { TEMPLATES };
