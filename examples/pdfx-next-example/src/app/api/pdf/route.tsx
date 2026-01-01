import { generate } from "@pdfx-dev/cli";
import { NextRequest } from "next/server";
import templatesConfig from "@/config/templates.json";

// Template imports
import Invoice from "../../../../pdf-templates/invoice";
import Letter from "../../../../pdf-templates/letter";
import Contract from "../../../../pdf-templates/contract";
import Ticket from "../../../../pdf-templates/ticket";
import Poster from "../../../../pdf-templates/poster";

// Template component map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateComponents: Record<string, React.ComponentType<any>> = {
  invoice: Invoice,
  letter: Letter,
  contract: Contract,
  ticket: Ticket,
  poster: Poster,
};

interface TemplateConfig {
  id: string;
  name: string;
  pageSize: string;
  orientation: string;
}

const templates = templatesConfig.templates as TemplateConfig[];

function getTemplate(id: string) {
  const config = templates.find((t) => t.id === id);
  if (!config) return null;

  const Component = templateComponents[id];
  if (!Component) return null;

  return { config, Component };
}

/**
 * PDF Generation API
 *
 * Query params:
 *   ?template=id   - Template to use (default: invoice)
 *   ?html=true     - Return HTML instead of PDF (for preview)
 *   ?debug=true    - Add debug overlay (grid, margin indicators)
 *
 * Examples:
 *   /api/pdf                     - Generate PDF (default template)
 *   /api/pdf?template=invoice    - Invoice (A4)
 *   /api/pdf?template=letter     - Business Letter (Letter)
 *   /api/pdf?template=contract   - Contract (Legal)
 *   /api/pdf?template=ticket     - Event Ticket (A5)
 *   /api/pdf?template=poster     - Poster (Tabloid Landscape)
 *   /api/pdf?html=true           - Preview HTML
 *   /api/pdf?debug=true          - PDF with debug grid
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const templateId = searchParams.get("template") || "invoice";
  const wantHtml = searchParams.get("html") === "true";
  const debug = searchParams.get("debug") === "true";
  const start = performance.now();

  // Get template
  const template = getTemplate(templateId);

  if (!template) {
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

  const { config, Component } = template;
  const { name, pageSize, orientation } = config;

  const params = [wantHtml && "html", debug && "debug"].filter(Boolean).join(", ");

  console.log(
    `[pdf] ${wantHtml ? "render" : "generate"} "${name}" (${pageSize} ${orientation})${params ? ` [${params}]` : ""}`
  );

  try {
    if (wantHtml) {
      // Return HTML for browser preview
      // Call component with empty props - defaults provide sample data
      const html = await generate(<Component />, {
        output: "html",
        debug,
      });

      const duration = Math.round(performance.now() - start);
      console.log(`[pdf] ✓ rendered in ${duration}ms`);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Generate PDF
    // Call component with empty props - defaults provide sample data
    const pdf = await generate(<Component />, { debug });
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
    const isServerError = message.includes("Cannot connect to PDFX server");
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
  <p>The PDFX server is not running. Start it with:</p>
  <pre>npx pdfx serve</pre>
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
