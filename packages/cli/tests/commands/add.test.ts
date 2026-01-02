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
  });

  it("lists templates when no argument provided", () => {
    const output = execSync(`node ${CLI_PATH} add`, {
      encoding: "utf-8",
    });

    expect(output).toContain("Available templates:");
  });

  it("adds invoice template to custom directory", () => {
    execSync(`node ${CLI_PATH} add invoice --output ${TEST_OUTPUT_DIR}`, {
      encoding: "utf-8",
    });

    const templatePath = join(TEST_OUTPUT_DIR, "invoice.tsx");
    expect(existsSync(templatePath)).toBe(true);

    const content = readFileSync(templatePath, "utf-8");
    expect(content).toContain("Invoice");
    expect(content).toContain("@pdfx-dev/react");
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
});
