import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

/**
 * Event Ticket template - A5 size (smaller format)
 *
 * Demonstrates:
 * - Compact page size (A5: 148mm x 210mm)
 * - Creative visual design with banner
 * - QR code placeholder
 */

interface TicketProps {
  event?: string;
  year?: string;
  tagline?: string;
  date?: string;
  time?: string;
  venue?: string;
  venueAddress?: string;
  attendee?: string;
  ticketType?: string;
  ticketNumber?: string;
  price?: string;
}

export default function Ticket({
  event = "Tech Conference",
  year = "2025",
  tagline = "Innovation Meets Inspiration",
  date = "March 15, 2025",
  time = "9:00 AM - 6:00 PM",
  venue = "Convention Center",
  venueAddress = "123 Main St, San Francisco, CA",
  attendee = "John Smith",
  ticketType = "VIP Access",
  ticketNumber = "TC25-VIP-001234",
  price = "$599.00",
}: TicketProps) {
  return (
    <Document title={`Ticket - ${event}`}>
      <Tailwind>
        <Page size="A5" margin="0">
          {/* Header Banner */}
          <div className="bg-gray-900 px-6 py-7 text-center">
            <div className="text-3xl font-black text-white tracking-wide">
              {event}
              {year && <span className="text-cyan-400"> {year}</span>}
            </div>
            {tagline && (
              <div className="text-sm text-cyan-400 mt-2 font-medium uppercase tracking-widest">
                {tagline}
              </div>
            )}
          </div>

          {/* Ticket Content */}
          <div className="px-6 py-5">
            {/* Ticket Type Badge */}
            <div className="flex justify-center -mt-10 mb-5">
              <div className="bg-cyan-500 text-gray-900 text-xs font-bold uppercase px-5 py-2 rounded-full tracking-widest">
                {ticketType}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-lg p-3.5 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Date
                </div>
                <div className="text-base font-bold text-gray-900 mt-1">{date}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3.5 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Time
                </div>
                <div className="text-base font-bold text-gray-900 mt-1">{time}</div>
              </div>
            </div>

            {/* Venue */}
            <div className="bg-gray-50 rounded-lg p-3.5 text-center mb-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Venue
              </div>
              <div className="text-base font-bold text-gray-900 mt-1">{venue}</div>
              <div className="text-xs text-gray-500 mt-1">{venueAddress}</div>
            </div>

            {/* Tear Line */}
            <div className="flex items-center gap-2 my-5">
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
              <div className="text-sm text-gray-400">✂</div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            </div>

            {/* Attendee Section */}
            <div className="text-center mb-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                Admit One
              </div>
              <div className="text-4xl font-black text-gray-900">{attendee}</div>
            </div>

            {/* QR Code Area */}
            <div className="flex justify-center mb-5">
              <div className="w-36 h-36 bg-white border-2 border-gray-900 rounded-xl p-2 flex items-center justify-center">
                {/* Simulated QR pattern */}
                <div className="grid grid-cols-5 gap-1 w-full h-full">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 19, 20, 22, 23, 24].includes(i)
                          ? "bg-gray-900"
                          : "bg-gray-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-sm border-t-2 border-gray-900 pt-3">
              <div className="font-mono text-xs text-gray-600">{ticketNumber}</div>
              <div className="font-bold text-lg text-gray-900">{price}</div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Non-transferable • Non-refundable • Present at entry
            </p>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
