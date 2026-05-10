import { Product, Alert, SalesDataPoint, Supplier, Customer } from "@/types";

export const mockProducts: Product[] = [
  { id: "p1", sku: "SKU-8021", name: "Maize Flour 2kg", category: "Groceries", stockQty: 45, threshold: 20, daysRemaining: 15, expiryDate: "2026-11-01", status: "In stock", price: 5000 },
  { id: "p2", sku: "SKU-9923", name: "Cooking Oil 1L", category: "Groceries", stockQty: 8, threshold: 15, daysRemaining: 3, expiryDate: "2027-02-14", status: "Low stock", price: 8500 },
  { id: "p3", sku: "SKU-1024", name: "Portland Cement 50kg", category: "Hardware", stockQty: 0, threshold: 50, daysRemaining: null, expiryDate: null, status: "Out of stock", price: 32000 },
  { id: "p4", sku: "SKU-3301", name: "Solar Lantern", category: "Electronics", stockQty: 12, threshold: 10, daysRemaining: null, expiryDate: null, status: "In stock", price: 45000 },
  { id: "p5", sku: "SKU-7754", name: "Washing Soap Box", category: "Groceries", stockQty: 150, threshold: 50, daysRemaining: null, expiryDate: "2028-01-01", status: "In stock", price: 2000 },
];

export const mockAlerts: Alert[] = [
  { id: "a1", title: "Out of Stock", description: "Portland Cement 50kg · Main Branch", severity: "critical", timestamp: "10 mins ago", resolved: false },
  { id: "a2", title: "Low Stock Warning", description: "Cooking Oil 1L · Entebbe Branch", severity: "warning", timestamp: "2 hours ago", resolved: false },
  { id: "a3", title: "Anomaly Detected", description: "Unusual sales drop for Solar Lanterns", severity: "info", timestamp: "Yesterday", resolved: false },
];

export const mockSalesData: SalesDataPoint[] = [
  { date: "Mon", revenue: 1200000, Electronics: 400000, Groceries: 600000, Hardware: 200000 },
  { date: "Tue", revenue: 1500000, Electronics: 500000, Groceries: 700000, Hardware: 300000 },
  { date: "Wed", revenue: 1800000, Electronics: 600000, Groceries: 800000, Hardware: 400000 },
  { date: "Thu", revenue: 1400000, Electronics: 450000, Groceries: 650000, Hardware: 300000 },
  { date: "Fri", revenue: 2100000, Electronics: 800000, Groceries: 900000, Hardware: 400000 },
  { date: "Sat", revenue: 2800000, Electronics: 1000000, Groceries: 1200000, Hardware: 600000 },
  { date: "Sun", revenue: 2500000, Electronics: 900000, Groceries: 1100000, Hardware: 500000 },
];

export const mockTopProducts = [
  { name: "Washing Soap Box", units: 342, revenue: 684000, trend: "up" },
  { name: "Maize Flour 2kg", units: 210, revenue: 1050000, trend: "up" },
  { name: "Cooking Oil 1L", units: 145, revenue: 1232500, trend: "down" },
  { name: "Solar Lantern", units: 82, revenue: 3690000, trend: "up" },
];

export const mockSuppliers: Supplier[] = [
  { id: "s1", name: "Mukwano Industries", contactPerson: "John Kato", email: "sales@mukwano.com", phone: "+256 700 123456", fulfillmentRating: 98, status: "active" },
  { id: "s2", name: "Kakira Sugar Ltd", contactPerson: "Aisha Nambozo", email: "dist@kakirasugar.com", phone: "+256 772 987654", fulfillmentRating: 95, status: "active" },
  { id: "s3", name: "SolarNow Uganda", contactPerson: "David Okello", email: "info@solarnow.ug", phone: "+256 752 456789", fulfillmentRating: 82, status: "inactive" },
  { id: "s4", name: "Tororo Cement", contactPerson: "Grace Akello", email: "orders@tororocement.com", phone: "+256 782 112233", fulfillmentRating: 88, status: "active" },
];

export const mockCustomers: Customer[] = [
  { id: "c1", companyName: "Quality Supermarket", contactPerson: "Sarah Namukasa", email: "procurement@quality.co.ug", lifetimeValue: 45000000, outstandingBalance: 2500000, lastOrderDate: "2026-05-08" },
  { id: "c2", companyName: "Mega Hardware Store", contactPerson: "Peter Kiggundu", email: "peter@megahardware.ug", lifetimeValue: 120000000, outstandingBalance: 0, lastOrderDate: "2026-05-10" },
  { id: "c3", companyName: "Nalya Minimart", contactPerson: "Joanita K", email: "joanita@nalyaminimart.com", lifetimeValue: 8500000, outstandingBalance: 500000, lastOrderDate: "2026-05-01" },
];
