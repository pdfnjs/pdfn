import { render, type DebugOptions } from "@pdfn/react";
import { renderTemplate } from "@pdfn/next";
import { NextRequest } from "next/server";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { templates } from "@/config/templates";

// PDF cache settings
const USE_CACHE = process.env.PDFN_USE_CACHE !== "false"; // Default: true
const CACHE_DIR = join(process.cwd(), "public", "pdfs");

// Template imports (server-safe only - no "use client" components)
import Invoice from "../../../../pdfn-templates/invoice";
import Letter from "../../../../pdfn-templates/letter";
import Contract from "../../../../pdfn-templates/contract";
import Ticket from "../../../../pdfn-templates/ticket";
import Poster from "../../../../pdfn-templates/poster";

// Template component map (excludes client-only templates like Report)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateComponents: Record<string, React.ComponentType<any>> = {
  invoice: Invoice,
  letter: Letter,
  contract: Contract,
  ticket: Ticket,
  poster: Poster,
};

/**
 * Check if a cached PDF exists for the given template and debug settings
 * Returns the cached PDF buffer if found, null otherwise
 */
function getCachedPdf(templateId: string, hasDebug: boolean): Buffer | null {
  if (!USE_CACHE) return null;

  // Cache key: template.pdf or template-debug.pdf
  const filename = hasDebug ? `${templateId}-debug.pdf` : `${templateId}.pdf`;
  const cachePath = join(CACHE_DIR, filename);

  if (existsSync(cachePath)) {
    try {
      return readFileSync(cachePath);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * PDF Generation API
 *
 * Query params:
 *   ?template=id   - Template to use (default: invoice)
 *   ?html=true     - Return HTML instead of PDF (for preview)
 *   ?debug=grid,margins,headers,breaks - Add debug overlays (comma-separated)
 *
 * Examples:
 *   /api/pdf                     - Generate PDF (default template)
 *   /api/pdf?template=invoice    - Invoice (A4)
 *   /api/pdf?template=letter     - Business Letter (Letter)
 *   /api/pdf?template=contract   - Contract (Legal)
 *   /api/pdf?template=ticket     - Event Ticket (A5)
 *   /api/pdf?template=poster     - Poster (Tabloid Landscape)
 *   /api/pdf?html=true           - Preview HTML
 *   /api/pdf?debug=grid,margins  - PDF with debug overlays
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const templateId = searchParams.get("template") || "invoice";
  const wantHtml = searchParams.get("html") === "true";
  const debugParam = searchParams.get("debug");
  const start = performance.now();

  // Parse debug options
  let debug: DebugOptions | false = false;
  if (debugParam) {
    if (debugParam === "true") {
      // Legacy support: debug=true enables all
      debug = { grid: true, margins: true, headers: true, breaks: true };
    } else {
      // Parse comma-separated options
      const options = debugParam.split(",").map(s => s.trim());
      debug = {
        grid: options.includes("grid"),
        margins: options.includes("margins"),
        headers: options.includes("headers"),
        breaks: options.includes("breaks"),
      };
    }
  }

  // Get template config
  const config = templates.find((t) => t.id === templateId);

  if (!config) {
    return new Response(
      JSON.stringify({
        error: `Template "${templateId}" not found`,
        available: templates.map((t) => t.id),
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check if template requires client-side rendering
  if (config.requiresClient) {
    const { name, pageSize, orientation } = config;

    // For HTML requests, render the template
    if (wantHtml) {
      console.log(`[pdf] render "${name}" (${pageSize} ${orientation}) [client]`);

      try {
        const { html } = await renderTemplate(templateId, {
          props: {},
          title: name,
          pageSize,
          orientation,
          debug: debug || undefined,
        });

        const duration = Math.round(performance.now() - start);
        console.log(`[pdf] ✓ client bundle generated in ${duration}ms`);

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Render-Time": duration.toString(),
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[pdf] ✗ client render failed: ${message}`);

        return new Response(
          `<!DOCTYPE html><html><body><h1>Error</h1><pre>${message}</pre></body></html>`,
          { status: 500, headers: { "Content-Type": "text/html" } }
        );
      }
    }

    // For PDF requests, check cache first
    const hasDebug = debug !== false && Object.values(debug).some(Boolean);
    const cachedPdf = getCachedPdf(templateId, hasDebug);

    if (cachedPdf) {
      const duration = Math.round(performance.now() - start);
      console.log(`[pdf] ✓ served from cache in ${duration}ms (${(cachedPdf.length / 1024).toFixed(1)}KB) [client]`);

      const filename = `${name}-${templateId}.pdf`.replace(/\s+/g, "-");
      return new Response(new Uint8Array(cachedPdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "X-PDF-Title": name,
          "X-PDF-Cache": "hit",
        },
      });
    }

    // No cache - need to generate via pdfn server
    console.log(`[pdf] generate "${name}" (${pageSize} ${orientation}) [client]`);

    try {
      const { html } = await renderTemplate(templateId, {
        props: {},
        title: name,
        pageSize,
        orientation,
        debug: debug || undefined,
      });

      const pdfnHost = process.env.PDFN_HOST ?? "http://localhost:3456";
      const response = await fetch(`${pdfnHost}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error(`PDFN server error: ${response.status} ${response.statusText}`);
      }

      const pdf = Buffer.from(await response.arrayBuffer());
      const pdfDuration = Math.round(performance.now() - start);
      console.log(`[pdf] ✓ generated in ${pdfDuration}ms (${(pdf.length / 1024).toFixed(1)}KB)`);

      const filename = `${name}-${templateId}.pdf`.replace(/\s+/g, "-");
      return new Response(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "X-PDF-Title": name,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[pdf] ✗ client render failed: ${message}`);

      return new Response(
        `<!DOCTYPE html><html><body><h1>Error</h1><pre>${message}</pre></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // Get component (only available for server-safe templates)
  const Component = templateComponents[templateId];
  if (!Component) {
    return new Response(
      JSON.stringify({ error: `Component for "${templateId}" not available` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const { name, pageSize, orientation } = config;

  const debugOptions = typeof debug === "object" ? Object.entries(debug).filter(([, v]) => v).map(([k]) => k) : [];
  const params = [wantHtml && "html", debugOptions.length > 0 && `debug:${debugOptions.join(",")}`].filter(Boolean).join(", ");

  console.log(
    `[pdf] ${wantHtml ? "render" : "generate"} "${name}" (${pageSize} ${orientation})${params ? ` [${params}]` : ""}`
  );

  try {
    // Render React to HTML with optional debug overlays
    const html = await render(<Component />, { debug: debug || undefined });

    if (wantHtml) {
      // Return HTML for browser preview
      const duration = Math.round(performance.now() - start);
      console.log(`[pdf] ✓ rendered in ${duration}ms`);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Render-Time": duration.toString(),
        },
      });
    }

    // Check cache first (only for default data requests)
    const hasDebug = debug !== false && Object.values(debug).some(Boolean);
    const cachedPdf = getCachedPdf(templateId, hasDebug);

    if (cachedPdf) {
      const duration = Math.round(performance.now() - start);
      console.log(`[pdf] ✓ served from cache in ${duration}ms (${(cachedPdf.length / 1024).toFixed(1)}KB)`);

      const filename = `${name}-${templateId}.pdf`.replace(/\s+/g, "-");
      return new Response(new Uint8Array(cachedPdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "X-PDF-Title": name,
          "X-PDF-Cache": "hit",
        },
      });
    }

    // Generate PDF via PDFN server
    const pdfnHost = process.env.PDFN_HOST ?? "http://localhost:3456";
    const response = await fetch(`${pdfnHost}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error(`PDFN server error: ${response.status} ${response.statusText}`);
    }

    const pdf = Buffer.from(await response.arrayBuffer());
    const duration = Math.round(performance.now() - start);

    console.log(`[pdf] ✓ generated in ${duration}ms (${(pdf.length / 1024).toFixed(1)}KB)`);

    // Build a descriptive filename
    const filename = `${name}-${templateId}.pdf`.replace(/\s+/g, "-");

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-PDF-Title": name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[pdf] ✗ failed: ${message}`);

    // Return HTML error page so browser displays it instead of downloading JSON
    const isServerError = message.includes("PDFN server error") || message.includes("fetch failed");
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>PDF Generation Failed</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; }
    h1 { color: #dc2626; }
    pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>PDF Generation Failed</h1>
  ${isServerError ? `
  <p>The pdfn server is not running. Start it with:</p>
  <pre>npx pdfn serve</pre>
  <p>Then refresh this page.</p>
  ` : `
  <p>Error details:</p>
  <pre>${message}</pre>
  `}
</body>
</html>`;

    return new Response(html, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

/**
 * List available templates
 */
export async function OPTIONS() {
  return new Response(
    JSON.stringify({
      templates: templates.map(({ id, name, pageSize, orientation }) => ({
        id,
        name,
        pageSize,
        orientation,
      })),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
