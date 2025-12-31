import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { TicketData } from "./types";

/**
 * Event Ticket template - A5 size (smaller format)
 */
export default function Ticket({ data }: { data: TicketData }) {
  return (
    <Document title={`Ticket - ${data.event}`}>
      <Tailwind>
        <Page size="A5" margin="0">
          {/* Header Banner with gradient effect */}
          <div className="bg-gray-900 px-6 py-8 text-center">
            <div className="text-4xl font-bold text-white tracking-wide font-display">
              {data.event}
              {data.year && <span className="text-cyan-400"> {data.year}</span>}
            </div>
            {data.tagline && (
              <div className="text-sm text-cyan-400 mt-2 font-medium">
                {data.tagline}
              </div>
            )}
          </div>

          {/* Ticket Content */}
          <div className="px-6 py-6">
            {/* Ticket Type Badge */}
            <div className="flex justify-center -mt-10 mb-6">
              <div className="bg-cyan-500 text-white text-xs font-bold uppercase px-5 py-2 rounded-full tracking-widest shadow-lg">
                {data.ticketType}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Date</div>
                <div className="text-base font-bold text-gray-900 mt-1">{data.date}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Time</div>
                <div className="text-base font-bold text-gray-900 mt-1">{data.time}</div>
              </div>
            </div>

            {/* Venue */}
            <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Venue</div>
              <div className="text-base font-bold text-gray-900 mt-1">{data.venue}</div>
              <div className="text-xs text-gray-500 mt-1">{data.venueAddress}</div>
            </div>

            {/* Tear Line */}
            <div className="flex items-center gap-2 my-6">
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            </div>

            {/* Attendee Section */}
            <div className="text-center mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                Admit One
              </div>
              <div className="text-3xl text-gray-900 font-script font-bold">
                {data.attendee}
              </div>
            </div>

            {/* QR Code Area */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 bg-white border-2 border-gray-900 rounded-xl p-2 flex items-center justify-center">
                {/* Simulated QR pattern */}
                <div className="grid grid-cols-5 gap-1 w-full h-full">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        [0,1,2,4,5,6,10,12,14,18,19,20,22,23,24].includes(i)
                          ? 'bg-gray-900'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-sm border-t-2 border-gray-900 pt-4">
              <div className="font-mono text-xs text-gray-600">
                {data.ticketNumber}
              </div>
              <div className="font-bold text-lg text-gray-900">{data.price}</div>
            </div>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
