import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

/**
 * Business Letter template - US Letter size
 *
 * Demonstrates:
 * - Professional letterhead
 * - Proper business letter format
 * - Single page layout
 */

interface LetterProps {
  sender?: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
    email: string;
    phone: string;
  };
  recipient?: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
  };
  date?: string;
  subject?: string;
  body?: string[];
  closing?: string;
  signature?: string;
}

export default function Letter({
  sender = {
    name: "Alex Chen",
    title: "Head of Partnerships",
    company: "Your Company",
    address: "123 Business St, Suite 100",
    city: "San Francisco, CA 94102",
    email: "alex@yourcompany.com",
    phone: "+1 (555) 123-4567",
  },
  recipient = {
    name: "Sarah Johnson",
    title: "Chief Technology Officer",
    company: "Acme Corporation",
    address: "456 Enterprise Blvd, Suite 100",
    city: "Austin, TX 78701",
  },
  date = "January 15, 2025",
  subject = "Partnership Proposal",
  body = [
    "I hope this letter finds you well. Following our conversation last month, I wanted to formally present our partnership proposal for your consideration.",
    "Our solution has helped over 500 companies streamline their workflows, reducing development time by an average of 60%. We believe our platform would be an excellent fit for your needs.",
    "I would welcome the opportunity to schedule a technical demo with your team. Please let me know if you would be available for a call next week.",
  ],
  closing = "Best regards",
  signature = "Alex Chen",
}: LetterProps) {
  return (
    <Document title={`Letter - ${subject}`}>
      <Tailwind>
        <Page size="Letter" margin="1in">
          {/* Letterhead */}
          <div className="mb-6 pb-3 border-b-2 border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-gray-900">{sender.company}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {sender.address} • {sender.city}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{sender.email}</div>
                <div>{sender.phone}</div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-sm text-gray-700 mb-6">{date}</div>

          {/* Recipient Info */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-900">{recipient.name}</div>
            {recipient.title && (
              <div className="text-sm text-gray-600">{recipient.title}</div>
            )}
            <div className="text-sm text-gray-600">{recipient.company}</div>
            <div className="text-sm text-gray-500">
              {recipient.address}, {recipient.city}
            </div>
          </div>

          {/* Subject Line */}
          <div className="mb-4 py-1.5 border-l-4 border-gray-800 pl-3 bg-gray-50">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Re: </span>
            <span className="text-sm font-medium text-gray-800">{subject}</span>
          </div>

          {/* Salutation */}
          <div className="text-sm text-gray-900 mb-3">Dear {recipient.name},</div>

          {/* Body */}
          <div className="space-y-3 mb-6">
            {body.map((paragraph, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Closing & Signature */}
          <div className="mt-6">
            <div className="text-sm text-gray-900 mb-6">{closing},</div>
            <div className="border-b border-gray-300 w-40 mb-1"></div>
            <div className="text-sm font-bold text-gray-900">{signature}</div>
            {sender.title && (
              <div className="text-xs text-gray-600">
                {sender.title}, {sender.company}
              </div>
            )}
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
