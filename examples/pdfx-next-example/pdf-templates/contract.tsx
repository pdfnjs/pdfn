import { Document, Page, PageNumber, TotalPages, AvoidBreak } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { ContractData } from "./types";

/**
 * Service Agreement Contract template - Legal size (taller page)
 *
 * Demonstrates:
 * - Watermark (e.g., "CONFIDENTIAL", "DRAFT")
 * - Repeating header on each page
 * - Repeating footer with page numbers
 * - Multi-page content with numbered terms
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
          } : undefined}
          header={
            <div className="flex justify-between items-center pb-3 border-b border-gray-300 mb-6">
              <div className="flex items-center gap-3">
                <img src="./pdf-templates/assets/logo.svg" alt="Logo" className="h-6" />
                <div className="text-xs text-gray-400">|</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {data.title}
                </div>
              </div>
              <div className="text-xs text-gray-500">
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
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            This {data.title} (&ldquo;Agreement&rdquo;) is entered into as of{" "}
            <span className="font-semibold">{data.effectiveDate}</span> by and between
            the following parties:
          </p>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-gray-800 rounded-lg p-4">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Service Provider
              </div>
              <div className="text-sm font-bold text-gray-900">
                {data.parties.provider.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.parties.provider.address}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="font-medium">Representative: </span>
                {data.parties.provider.representative}
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Client
              </div>
              <div className="text-sm font-bold text-gray-900">
                {data.parties.client.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.parties.client.address}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="font-medium">Representative: </span>
                {data.parties.client.representative}
              </div>
            </div>
          </div>

          {/* Terms Section Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t-2 border-gray-800"></div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Terms and Conditions
            </h2>
            <div className="flex-1 border-t-2 border-gray-800"></div>
          </div>

          {/* Terms */}
          <div className="space-y-5 mb-8">
            {data.terms.map((term, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
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

          {/* Agreement Statement */}
          <div className="mb-8 bg-gray-100 p-5 rounded-lg">
            <p className="text-xs text-gray-700 leading-relaxed text-center">
              <strong className="text-gray-900">IN WITNESS WHEREOF</strong>, the parties have executed this Agreement
              as of the Effective Date. Both parties acknowledge that they have read, understood,
              and agree to be bound by all terms and conditions set forth herein.
            </p>
          </div>

          {/* Signatures - wrapped in AvoidBreak to keep together */}
          <AvoidBreak>
            <div className="grid grid-cols-2 gap-10">
              {/* Provider Signature */}
              <div>
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                  Service Provider
                </div>
                <div className="border-b-2 border-gray-800 mb-2 h-10"></div>
                <div className="text-sm font-bold text-gray-900">
                  {data.signatures.provider.name}
                </div>
                <div className="text-xs text-gray-600">
                  {data.signatures.provider.title}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <div>Date: _______________</div>
                </div>
              </div>

              {/* Client Signature */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Client
                </div>
                <div className="border-b-2 border-gray-800 mb-2 h-10"></div>
                <div className="text-sm font-bold text-gray-900">
                  {data.signatures.client.name}
                </div>
                <div className="text-xs text-gray-600">
                  {data.signatures.client.title}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <div>Date: _______________</div>
                </div>
              </div>
            </div>
          </AvoidBreak>
        </Page>
      </Tailwind>
    </Document>
  );
}
