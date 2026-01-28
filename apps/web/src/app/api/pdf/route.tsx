import { pdfn, type DebugOptions } from "@pdfn/react";
import { renderTemplate } from "@pdfn/next";
import { NextRequest } from "next/server";
import { templates } from "@/config/templates";

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

// Create pdfn client for server-side rendering
const client = pdfn();

/**
 * Template HTML Preview API
 *
 * Query params:
 *   ?template=id   - Template to render (default: invoice)
 *   ?debug=grid,margins,headers,breaks - Add debug overlays (comma-separated)
 *
 * Examples:
 *   /api/pdf?template=invoice    - Invoice (A4)
 *   /api/pdf?template=letter     - Business Letter (Letter)
 *   /api/pdf?template=contract   - Contract (Legal)
 *   /api/pdf?template=ticket     - Event Ticket (A5)
 *   /api/pdf?template=poster     - Poster (Tabloid Landscape)
 *   /api/pdf?debug=grid,margins  - With debug overlays
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const templateId = searchParams.get("template") || "invoice";
  const debugParam = searchParams.get("debug");
  const start = performance.now();

  // Parse debug options
  let debug: DebugOptions | false = false;
  if (debugParam) {
    if (debugParam === "true") {
      debug = { grid: true, margins: true, headers: true, breaks: true };
    } else {
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

  const { name, pageSize, orientation } = config;

  // Client-side templates (e.g. Report with Recharts) use renderTemplate
  if (config.requiresClient) {
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

  // Server-safe templates use client.render()
  const Component = templateComponents[templateId];
  if (!Component) {
    return new Response(
      JSON.stringify({ error: `Component for "${templateId}" not available` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`[pdf] render "${name}" (${pageSize} ${orientation})`);

  try {
    const { data, error } = await client.render({ react: <Component />, debug: debug || undefined });

    if (error) {
      throw new Error(error.message);
    }

    const duration = Math.round(performance.now() - start);
    console.log(`[pdf] ✓ rendered in ${duration}ms`);

    return new Response(data.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Render-Time": duration.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[pdf] ✗ failed: ${message}`);

    return new Response(
      `<!DOCTYPE html><html><body><h1>Error</h1><pre>${message}</pre></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
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
