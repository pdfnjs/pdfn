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
    logo?: string; // Base64 or URL
    address: string;
    email: string;
    phone: string;
  };
}

// Add more template data types as needed
// export interface CertificateData { ... }
// export interface ReportData { ... }
