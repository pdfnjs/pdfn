import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { LetterData } from "./types";

/**
 * Business Letter template - US Letter size
 *
 * Demonstrates:
 * - Professional letterhead with company branding
 * - Proper business letter format
 * - Single page layout
 */
export default function Letter({ data }: { data: LetterData }) {
  return (
    <Document title={`Letter - ${data.subject}`}>
      <Tailwind>
        <Page size="Letter" margin="1in">
          {/* Letterhead */}
          <div className="mb-6 pb-3 border-b-2 border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <img src="./pdf-templates/assets/logo.svg" alt="Company Logo" className="h-8 mb-2" />
                <div className="text-xs text-gray-500">
                  {data.sender.address} • {data.sender.city}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{data.sender.email}</div>
                <div>{data.sender.phone}</div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-sm text-gray-700 mb-6">
            {data.date}
          </div>

          {/* Recipient Info */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-900">{data.recipient.name}</div>
            {data.recipient.title && (
              <div className="text-sm text-gray-600">{data.recipient.title}</div>
            )}
            <div className="text-sm text-gray-600">{data.recipient.company}</div>
            <div className="text-sm text-gray-500">{data.recipient.address}, {data.recipient.city}</div>
          </div>

          {/* Subject Line */}
          <div className="mb-4 py-1.5 border-l-4 border-gray-800 pl-3 bg-gray-50">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Re: </span>
            <span className="text-sm font-medium text-gray-800">{data.subject}</span>
          </div>

          {/* Salutation */}
          <div className="text-sm text-gray-900 mb-3">
            Dear {data.recipient.name},
          </div>

          {/* Body */}
          <div className="space-y-3 mb-6">
            {data.body.map((paragraph, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Closing & Signature */}
          <div className="mt-6">
            <div className="text-sm text-gray-900 mb-6">{data.closing},</div>
            <div className="border-b border-gray-300 w-40 mb-1"></div>
            <div className="text-sm font-bold text-gray-900">{data.signature}</div>
            {data.sender.title && (
              <div className="text-xs text-gray-600">{data.sender.title}, {data.sender.company}</div>
            )}
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
