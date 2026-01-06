import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TEST_OUTPUT_DIR = join(process.cwd(), "test-output-templates");
const CLI_PATH = join(process.cwd(), "dist", "cli.js");

describe("add command", () => {
  beforeEach(() => {
    // Clean up test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
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
    const output = execSync(`node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    expect(output).toContain("inline styles");

    const templatePath = join(TEST_OUTPUT_DIR, "invoice.tsx");
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
    const output = execSync(`node ${CLI_PATH} add invoice --inline --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    expect(output).toContain("inline styles");

    const content = readFileSync(join(TEST_OUTPUT_DIR, "invoice.tsx"), "utf-8");
    expect(content).not.toContain("@pdfn/tailwind");
    expect(content).toContain("style={{");
  });

  it("adds letter template", () => {
    execSync(`node ${CLI_PATH} add letter --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    const templatePath = join(TEST_OUTPUT_DIR, "letter.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds contract template", () => {
    execSync(`node ${CLI_PATH} add contract --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    const templatePath = join(TEST_OUTPUT_DIR, "contract.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds ticket template", () => {
    execSync(`node ${CLI_PATH} add ticket --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    const templatePath = join(TEST_OUTPUT_DIR, "ticket.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("adds poster template", () => {
    execSync(`node ${CLI_PATH} add poster --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    const templatePath = join(TEST_OUTPUT_DIR, "poster.tsx");
    expect(existsSync(templatePath)).toBe(true);
  });

  it("fails for unknown template", () => {
    expect(() => {
      execSync(`node ${CLI_PATH} add unknown --output ${TEST_OUTPUT_DIR}`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("fails when file exists without --force", () => {
    // Create directory and file first
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    // Try to add again without --force
    expect(() => {
      execSync(`node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR}`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("overwrites file with --force", () => {
    // Create directory and file first
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    execSync(`node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    // Add again with --force should succeed
    const output = execSync(
      `node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR} --force`,
      { encoding: "utf-8" }
    );

    expect(output).toContain("Added");
  });

  it("creates output directory if it doesn't exist", () => {
    const nestedDir = join(TEST_OUTPUT_DIR, "nested", "templates");

    execSync(`node ${CLI_PATH} add invoice --output ${nestedDir}`, {
      encoding: "utf-8",
    });

    expect(existsSync(nestedDir)).toBe(true);
    expect(existsSync(join(nestedDir, "invoice.tsx"))).toBe(true);
  });

  it("warns when --tailwind is used without @pdfn/tailwind installed", () => {
    // Run from a directory without @pdfn/tailwind
    expect(() => {
      execSync(`node ${CLI_PATH} add invoice --tailwind --output ${TEST_OUTPUT_DIR}`, {
        encoding: "utf-8",
        stdio: "pipe",
        cwd: TEST_OUTPUT_DIR.replace("test-output-templates", ""), // Parent dir without node_modules
      });
    }).toThrow();
  });

  it("all inline templates exist and are valid", () => {
    const templates = ["invoice", "letter", "contract", "ticket", "poster"];

    for (const template of templates) {
      const outputDir = join(TEST_OUTPUT_DIR, template);
      execSync(`node ${CLI_PATH} add ${template} --output ${outputDir}`, {
        encoding: "utf-8",
      });

      const templatePath = join(outputDir, `${template}.tsx`);
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
