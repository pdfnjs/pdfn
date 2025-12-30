import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { ContractData } from "./types";

/**
 * Service Agreement Contract template - Legal size (taller page)
 */
export default function Contract({ data }: { data: ContractData }) {
  return (
    <Document title={data.title}>
      <Tailwind>
        <Page size="Legal" margin="1in">
          {/* Title Block */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-900">
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest">
              {data.title}
            </h1>
            <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
              <div>
                <span className="font-semibold text-gray-700">Effective Date: </span>
                {data.effectiveDate}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Contract No: </span>
                SA-2025-001
              </div>
            </div>
          </div>

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
            <div className="space-y-3">
              {data.terms.map((term, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">
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

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8">
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
        </Page>
      </Tailwind>
    </Document>
  );
}
