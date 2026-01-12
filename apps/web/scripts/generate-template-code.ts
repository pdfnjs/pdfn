#!/usr/bin/env npx tsx

/**
 * Generates src/lib/template-code.ts from pdfn-templates/*.tsx
 *
 * Uses src/config/templates.ts as the source of truth for template list.
 * Run this before build to keep code in sync.
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { templates } from "../src/config/templates.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEMPLATES_DIR = join(__dirname, "..", "pdfn-templates");
const OUTPUT_FILE = join(__dirname, "..", "src", "lib", "template-code.ts");

function generateTemplateCode() {
  const codeMap: Record<string, string> = {};

  for (const template of templates) {
    const filePath = join(TEMPLATES_DIR, `${template.id}.tsx`);
    try {
      const code = readFileSync(filePath, "utf-8");
      codeMap[template.id] = code;
    } catch {
      console.error(`Warning: Could not read ${filePath}`);
    }
  }

  const output = `// Auto-generated from pdfn-templates/*.tsx - DO NOT EDIT MANUALLY
// Run: pnpm generate-template-code

export const templateCode: Record<string, string> = ${JSON.stringify(codeMap, null, 2)};
`;

  writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${OUTPUT_FILE} with ${Object.keys(codeMap).length} templates`);
}

generateTemplateCode();
