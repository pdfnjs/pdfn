/**
 * Generate cached PDFs for demo site
 *
 * Usage: pnpm generate-demo-pdfs
 *
 * Requires:
 * 1. PDFN server running: pnpm --filter pdfn exec pdfn serve
 * 2. Next.js dev server running: pnpm --filter web dev
 */

import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const PDFN_HOST = process.env.PDFN_HOST || "http://localhost:3456";
const NEXTJS_HOST = process.env.NEXTJS_HOST || "http://localhost:3000";
const OUTPUT_DIR = join(process.cwd(), "public", "pdfs");

// Templates to generate
const TEMPLATES = ["invoice", "ticket", "poster", "contract", "letter"];

// Debug options for "debug-all" variant
const DEBUG_ALL = "grid,margins,headers,breaks";

async function generatePdf(
  template: string,
  debug?: string
): Promise<Buffer | null> {
  const url = new URL("/api/pdf", NEXTJS_HOST);
  url.searchParams.set("template", template);
  if (debug) {
    url.searchParams.set("debug", debug);
  }

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/pdf")) {
      const text = await response.text();
      throw new Error(`Expected PDF, got ${contentType}: ${text.slice(0, 200)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`  ✗ Failed to generate ${template}:`, error);
    return null;
  }
}

async function main() {
  console.log("\n📄 PDFN Demo PDF Generator\n");
  console.log(`  PDFN Server: ${PDFN_HOST}`);
  console.log(`  Next.js Server: ${NEXTJS_HOST}`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);

  // Check if PDFN server is running
  try {
    const health = await fetch(`${PDFN_HOST}/health`);
    if (!health.ok) throw new Error("Health check failed");
    console.log("  ✓ PDFN server is running");
  } catch {
    console.error("  ✗ PDFN server is not running");
    console.error(`    Start it with: pnpm --filter pdfn exec pdfn serve\n`);
    process.exit(1);
  }

  // Check if Next.js server is running
  try {
    const response = await fetch(`${NEXTJS_HOST}/api/pdf?template=invoice&html=true`);
    if (!response.ok) throw new Error("API check failed");
    console.log("  ✓ Next.js server is running\n");
  } catch {
    console.error("  ✗ Next.js server is not running");
    console.error(`    Start it with: pnpm --filter web dev\n`);
    process.exit(1);
  }

  // Clean output directory
  if (existsSync(OUTPUT_DIR)) {
    const files = readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".pdf"));
    if (files.length > 0) {
      console.log(`  Cleaning ${files.length} existing PDF(s)...`);
      for (const file of files) {
        rmSync(join(OUTPUT_DIR, file));
      }
    }
  } else {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`  Generating PDFs for ${TEMPLATES.length} templates...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const template of TEMPLATES) {
    // Generate default version
    process.stdout.write(`  ${template}.pdf ... `);
    const defaultPdf = await generatePdf(template);
    if (defaultPdf) {
      writeFileSync(join(OUTPUT_DIR, `${template}.pdf`), defaultPdf);
      console.log(`✓ ${(defaultPdf.length / 1024).toFixed(1)}KB`);
      successCount++;
    } else {
      console.log("✗ failed");
      failCount++;
    }

    // Generate debug version
    process.stdout.write(`  ${template}-debug.pdf ... `);
    const debugPdf = await generatePdf(template, DEBUG_ALL);
    if (debugPdf) {
      writeFileSync(join(OUTPUT_DIR, `${template}-debug.pdf`), debugPdf);
      console.log(`✓ ${(debugPdf.length / 1024).toFixed(1)}KB`);
      successCount++;
    } else {
      console.log("✗ failed");
      failCount++;
    }
  }

  console.log(`\n  Done! Generated ${successCount} PDFs`);
  if (failCount > 0) {
    console.log(`  ⚠ ${failCount} failed`);
  }

  // List generated files
  const files = readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".pdf"));
  const totalSize = files.reduce((sum, f) => {
    return sum + statSync(join(OUTPUT_DIR, f)).size;
  }, 0);

  console.log(`\n  Total: ${files.length} files, ${(totalSize / 1024).toFixed(1)}KB\n`);
}

main().catch(console.error);
