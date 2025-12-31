import { Document, Page, PageNumber, TotalPages, AvoidBreak } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { ContractData } from "./types";

/**
 * Service Agreement Contract template - Legal size (taller page)
 *
 * Demonstrates:
 * - Watermark (diagonal "DRAFT" text)
 * - Repeating header on each page
 * - Repeating footer with page numbers
 * - Multi-page content (8+ terms)
 * - AvoidBreak for signature block
 */
export default function Contract({ data }: { data: ContractData }) {
  return (
    <Document title={data.title}>
      <Tailwind>
        <Page
          size="Legal"
          margin="1in"
          watermark={data.watermark ? {
            text: data.watermark,
            opacity: 0.08,
            rotation: -35,
            className: "text-8xl font-black text-gray-400 uppercase tracking-widest"
          } : undefined}
          header={
            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold tracking-tight">
                  <span className="text-gray-600">pdf</span>
                  <span className="text-cyan-500">x</span>
                </div>
                <div className="text-xs text-gray-400">|</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {data.title}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Effective: {data.effectiveDate}
              </div>
            </div>
          }
          footer={
            <div className="pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div>
                  {data.parties.provider.name} — Confidential
                </div>
                <div>
                  Page <PageNumber /> of <TotalPages />
                </div>
              </div>
            </div>
          }
        >

          {/* Parties Introduction */}
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            This Service Agreement (&ldquo;Agreement&rdquo;) is entered into as of the Effective Date
            by and between the following parties:
          </p>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1.5">
                Service Provider
              </div>
              <div className="text-sm font-bold text-gray-900">
                {data.parties.provider.name}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {data.parties.provider.address}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Representative: </span>
                {data.parties.provider.representative}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Client
              </div>
              <div className="text-sm font-bold text-gray-900">
                {data.parties.client.name}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {data.parties.client.address}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Representative: </span>
                {data.parties.client.representative}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="flex-1 border-t border-gray-300"></span>
              <span>Terms and Conditions</span>
              <span className="flex-1 border-t border-gray-300"></span>
            </h2>
            <div className="space-y-4">
              {data.terms.map((term, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {term.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {term.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agreement Statement */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-700 leading-relaxed text-center">
              <strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the
              Effective Date. Both parties acknowledge that they have read, understood, and agree
              to be bound by all terms and conditions set forth herein.
            </p>
          </div>

          {/* Signatures - wrapped in AvoidBreak to keep together */}
          <AvoidBreak>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-4">
                  Service Provider
                </div>
                <div className="border-b-2 border-gray-900 mb-2 h-8"></div>
                <div className="text-sm font-bold text-gray-900">
                  {data.signatures.provider.name}
                </div>
                <div className="text-xs text-gray-600">
                  {data.signatures.provider.title}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Date: _______________
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Client
                </div>
                <div className="border-b-2 border-gray-900 mb-2 h-8"></div>
                <div className="text-sm font-bold text-gray-900">
                  {data.signatures.client.name}
                </div>
                <div className="text-xs text-gray-600">
                  {data.signatures.client.title}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Date: _______________
                </div>
              </div>
            </div>
          </AvoidBreak>
        </Page>
      </Tailwind>
    </Document>
  );
}
