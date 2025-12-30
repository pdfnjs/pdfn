/**
 * Shared types for PDF templates
 */

export interface InvoiceData {
  number: string;
  customer: string;
  date: string;
  dueDate: string;
  items: Array<{
    name: string;
    description?: string;
    qty: number;
    price: number;
  }>;
  notes?: string;
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

export interface LetterData {
  sender: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
    email: string;
    phone: string;
  };
  recipient: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
  };
  date: string;
  subject: string;
  body: string[];
  closing: string;
  signature: string;
}

export interface ContractData {
  title: string;
  effectiveDate: string;
  parties: {
    provider: {
      name: string;
      address: string;
      representative: string;
    };
    client: {
      name: string;
      address: string;
      representative: string;
    };
  };
  terms: Array<{
    title: string;
    content: string;
  }>;
  signatures: {
    provider: { name: string; title: string };
    client: { name: string; title: string };
  };
}

export interface TicketData {
  event: string;
  year?: string;
  tagline?: string;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  attendee: string;
  ticketType: string;
  ticketNumber: string;
  price: string;
}

export interface PosterData {
  headline: string;
  year?: string;
  subheadline?: string;
  date: string;
  venue: string;
  highlights: string[];
  cta: string;
  website: string;
  logo?: string;
}
