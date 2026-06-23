export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  category_id: number | null;
  description?: string;
  stockQty: number;
  threshold: number;
  daysRemaining: number | null;
  expiryDate: string | null;
  status: 'In stock' | 'Low stock' | 'Out of stock' | 'On order';
  price: number;
  costPrice?: number;
  primarySupplier?: string;
  primarySupplierId?: number | string | null;
  stocks?: {
    id: number;
    product: number | string;
    product_name: string;
    branch: number;
    branch_name: string;
    quantity: number;
  }[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  resolved: boolean;
  branch?: number | string | null;
  branch_name?: string | null;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  Electronics: number;
  Groceries: number;
  Hardware: number;
}

export interface TopProduct {
  name: string;
  units: number;
  revenue: number;
  trend: 'up' | 'down' | string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  fulfillmentRating: number;
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

export interface Branch {
  id: number;
  name: string;
  code: string;
  location: string;
  manager: string;
  revenue: number;
  trend: number;
  stockValue: number;
  activeAlerts: number;
}

export interface BranchDetail extends Branch {
  alerts: { title: string; severity: string }[];
  topItems: { name: string; units: number }[];
}

export interface StockHistoryPoint {
  date: string;
  stock: number;
}

export interface PurchaseOrderItem {
  product: number | string;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseOrder {
  id?: number;
  supplier: number | string;
  supplier_name?: string;
  branch: number | string;
  branch_name?: string;
  status?: "draft" | "sent" | "received";
  total_value?: number;
  items: PurchaseOrderItem[];
  created_at?: string;
  updated_at?: string;
}
