import { render, generate } from "@pdfx-dev/react";
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
const templateComponents: Record<string, React.ComponentType<{ data: any }>> = {
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
  sampleData: Record<string, unknown> & { number?: string };
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
  const { sampleData, name, pageSize, orientation } = config;

  const params = [wantHtml && "html", debug && "debug"].filter(Boolean).join(", ");

  console.log(
    `[pdf] ${wantHtml ? "render" : "generate"} "${name}" (${pageSize} ${orientation})${params ? ` [${params}]` : ""}`
  );

  try {
    if (wantHtml) {
      // Return HTML for browser preview
      const html = await render(<Component data={sampleData} />, { debug });
      const duration = Math.round(performance.now() - start);

      console.log(`[pdf] ✓ rendered in ${duration}ms`);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Generate PDF
    const pdf = await generate(<Component data={sampleData} />, {
      render: { debug },
    });
    const duration = Math.round(performance.now() - start);

    console.log(`[pdf] ✓ generated in ${duration}ms (${(pdf.length / 1024).toFixed(1)}KB)`);

    // Build a descriptive filename
    const docNumber = sampleData.number || templateId;
    const filename = `${name}-${docNumber}.pdf`.replace(/\s+/g, "-");

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-PDF-Title": `${name} ${docNumber}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[pdf] ✗ failed: ${message}`);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
