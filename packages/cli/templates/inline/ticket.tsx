import { Document, Page } from "@pdfn/react";

/**
 * Event Ticket template - A5 size (inline styles)
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
      <Page size="A5" margin="0">
        {/* Header Banner */}
        <div style={{ backgroundColor: "#111827", padding: "28px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "30px", fontWeight: "900", color: "white", letterSpacing: "0.05em" }}>
            {event}
            {year && <span style={{ color: "#22d3ee" }}> {year}</span>}
          </div>
          {tagline && (
            <div style={{ fontSize: "14px", color: "#22d3ee", marginTop: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              {tagline}
            </div>
          )}
        </div>

        {/* Ticket Content */}
        <div style={{ padding: "20px 24px" }}>
          {/* Ticket Type Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "-40px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#06b6d4", color: "#111827", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", padding: "8px 20px", borderRadius: "9999px", letterSpacing: "0.2em" }}>
              {ticketType}
            </div>
          </div>

          {/* Event Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "500" }}>
                Date
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>{date}</div>
            </div>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "500" }}>
                Time
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>{time}</div>
            </div>
          </div>

          {/* Venue */}
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "500" }}>
              Venue
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>{venue}</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>{venueAddress}</div>
          </div>

          {/* Tear Line */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "20px 0" }}>
            <div style={{ flex: 1, borderTop: "2px dashed #d1d5db" }}></div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>✂</div>
            <div style={{ flex: 1, borderTop: "2px dashed #d1d5db" }}></div>
          </div>

          {/* Attendee Section */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "500", marginBottom: "4px" }}>
              Admit One
            </div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#111827" }}>{attendee}</div>
          </div>

          {/* QR Code Area */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ width: "144px", height: "144px", backgroundColor: "white", border: "2px solid #111827", borderRadius: "12px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Simulated QR pattern */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px", width: "100%", height: "100%" }}>
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: "2px",
                      backgroundColor: [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 19, 20, 22, 23, 24].includes(i)
                        ? "#111827"
                        : "#f3f4f6"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", borderTop: "2px solid #111827", paddingTop: "12px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#4b5563" }}>{ticketNumber}</div>
            <div style={{ fontWeight: "bold", fontSize: "18px", color: "#111827" }}>{price}</div>
          </div>

          {/* Terms */}
          <p style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", marginTop: "12px" }}>
            Non-transferable • Non-refundable • Present at entry
          </p>
        </div>
      </Page>
    </Document>
  );
}
