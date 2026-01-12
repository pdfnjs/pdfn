import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

// The add command always outputs to ./pdfn-templates
const OUTPUT_DIR = join(process.cwd(), "pdfn-templates");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("add command", () => {
  beforeEach(() => {
    // Clean up output directory
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true });
    }
  });

  it("lists available templates with --list", () => {
    const output = execSync(`node ${CLI_PATH} add --list`, {
      encoding: "utf-8",
    });

    expect(output).toContain("Available templates:");
    expect(output).toContain("invoice");
    expect(output).toContain("letter");
    expect(output).toContain("contract");
    expect(output).toContain("ticket");
    expect(output).toContain("poster");
    expect(output).toContain("--inline");
    expect(output).toContain("--tailwind");
  });

  it("lists templates when no argument provided", () => {
    const output = execSync(`node ${CLI_PATH} add`, {
      encoding: "utf-8",
    });

    expect(output).toContain("Available templates:");
  });

  it("adds invoice template with inline styles by default", () => {
    const output = execSync(`node ${CLI_PATH} add invoice`, {
      encoding: "utf-8",
    });

    expect(output).toContain("inline styles");

    const templatePath = join(OUTPUT_DIR, "invoice.tsx");
    expect(existsSync(templatePath)).toBe(true);

    const content = readFileSync(templatePath, "utf-8");
    expect(content).toContain("Invoice");
    expect(content).toContain("@pdfn/react");
    // Inline templates should NOT have @pdfn/tailwind import
    expect(content).not.toContain("@pdfn/tailwind");
    // Inline templates should use style={{ }} syntax
    expect(content).toContain("style={{");
  });

  it("adds invoice template with --inline flag explicitly", () => {
    const output = execSync(`node ${CLI_PATH} add invoice --inline`, {
      encoding: "utf-8",
    });

    expect(output).toContain("inline styles");

    const content = readFileSync(join(OUTPUT_DIR, "invoice.tsx"), "utf-8");
    expect(content).not.toContain("@pdfn/tailwind");
    expect(content).toContain("style={{");
  });

  it("adds letter template", () => {
    execSync(`node ${CLI_PATH} add letter`, {
      encoding: "utf-8",
    });

    const templatePath = join(OUTPUT_DIR, "letter.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds contract template", () => {
    execSync(`node ${CLI_PATH} add contract`, {
      encoding: "utf-8",
    });

    const templatePath = join(OUTPUT_DIR, "contract.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds ticket template", () => {
    execSync(`node ${CLI_PATH} add ticket`, {
      encoding: "utf-8",
    });

    const templatePath = join(OUTPUT_DIR, "ticket.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds poster template", () => {
    execSync(`node ${CLI_PATH} add poster`, {
      encoding: "utf-8",
    });

    const templatePath = join(OUTPUT_DIR, "poster.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("fails for unknown template", () => {
    expect(() => {
      execSync(`node ${CLI_PATH} add unknown`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("fails when file exists without --force", () => {
    // Create file first
    execSync(`node ${CLI_PATH} add invoice`, {
      encoding: "utf-8",
    });

    // Try to add again without --force
    expect(() => {
      execSync(`node ${CLI_PATH} add invoice`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("overwrites file with --force", () => {
    // Create file first
    execSync(`node ${CLI_PATH} add invoice`, {
      encoding: "utf-8",
    });

    // Add again with --force should succeed
    const output = execSync(`node ${CLI_PATH} add invoice --force`, {
      encoding: "utf-8",
    });

    expect(output).toContain("Added");
  });

  it("creates output directory if it doesn't exist", () => {
    // Ensure directory doesn't exist
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true });
    }

    execSync(`node ${CLI_PATH} add invoice`, {
      encoding: "utf-8",
    });

    expect(existsSync(OUTPUT_DIR)).toBe(true);
    expect(existsSync(join(OUTPUT_DIR, "invoice.tsx"))).toBe(true);
  });

  it("warns when --tailwind is used without @pdfn/tailwind installed", () => {
    // Run from a temp directory without @pdfn/tailwind
    const tempDir = join(process.cwd(), "test-temp-no-tailwind");
    mkdirSync(tempDir, { recursive: true });

    try {
      expect(() => {
        execSync(`node ${CLI_PATH} add invoice --tailwind`, {
          encoding: "utf-8",
          stdio: "pipe",
          cwd: tempDir,
        });
      }).toThrow();
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });

  it("all inline templates exist and are valid", () => {
    const templates = ["invoice", "letter", "contract", "ticket", "poster"];

    for (const template of templates) {
      // Clean up between templates
      if (existsSync(OUTPUT_DIR)) {
        rmSync(OUTPUT_DIR, { recursive: true });
      }

      execSync(`node ${CLI_PATH} add ${template}`, {
        encoding: "utf-8",
      });

      const templatePath = join(OUTPUT_DIR, `${template}.tsx`);
      expect(existsSync(templatePath)).toBe(true);

      const content = readFileSync(templatePath, "utf-8");
      // All inline templates should import from @pdfn/react
      expect(content).toContain("@pdfn/react");
      // All inline templates should NOT import from @pdfn/tailwind
      expect(content).not.toContain("@pdfn/tailwind");
      // All inline templates should use inline styles
      expect(content).toContain("style={{");
    }
  });

  it("all tailwind templates exist in templates/tailwind directory", () => {
    const templatesDir = join(process.cwd(), "templates", "tailwind");
    const templates = ["invoice", "letter", "contract", "ticket", "poster"];

    for (const template of templates) {
      const templatePath = join(templatesDir, `${template}.tsx`);
      expect(existsSync(templatePath)).toBe(true);

      const content = readFileSync(templatePath, "utf-8");
      // All tailwind templates should import from @pdfn/tailwind
      expect(content).toContain("@pdfn/tailwind");
      // All tailwind templates should use className
      expect(content).toContain("className=");
    }
  });

  it("all inline templates exist in templates/inline directory", () => {
    const templatesDir = join(process.cwd(), "templates", "inline");
    const templates = ["invoice", "letter", "contract", "ticket", "poster"];

    for (const template of templates) {
      const templatePath = join(templatesDir, `${template}.tsx`);
      expect(existsSync(templatePath)).toBe(true);

      const content = readFileSync(templatePath, "utf-8");
      // All inline templates should NOT import from @pdfn/tailwind
      expect(content).not.toContain("@pdfn/tailwind");
    }
  });
});
