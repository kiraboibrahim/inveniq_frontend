export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQty: number;
  threshold: number;
  daysRemaining: number | null; // AI prediction
  expiryDate: string | null;
  status: 'In stock' | 'Low stock' | 'Out of stock' | 'On order';
  price: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  resolved: boolean;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  Electronics: number;
  Groceries: number;
  Hardware: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  fulfillmentRating: number; // 0-100
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  lifetimeValue: number;
  outstandingBalance: number;
  lastOrderDate: string;
}
