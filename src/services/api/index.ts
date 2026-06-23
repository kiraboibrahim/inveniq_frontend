import api from "@/lib/api-client";
import { Product, Supplier, Customer, Alert, SalesDataPoint, Branch, StockHistoryPoint, PurchaseOrder } from "@/types";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout/");
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/password/reset/", { email });
    return response.data;
  },
  resetPassword: async (data: unknown) => {
    const response = await api.post("/auth/password/reset/confirm/", data);
    return response.data;
  },
};

export const inventoryService = {
  getProducts: async (branch?: string) => {
    const response = await api.get<Product[]>("/inventory/products/", { params: { branch } });
    return response.data;
  },
  getProduct: async (id: string) => {
    const response = await api.get<Product>(`/inventory/products/${id}/`);
    return response.data;
  },
  getProductBySku: async (sku: string) => {
    const response = await api.get<Product[]>("/inventory/products/", { params: { sku } });
    return response.data[0] || null;
  },
  createProduct: async (data: Partial<Product>) => {
    const response = await api.post<Product>("/inventory/products/", data);
    return response.data;
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await api.patch<Product>(`/inventory/products/${id}/`, data);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/inventory/products/${id}/`);
    return response.data;
  },
  importExcel: async (file: File, branchId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (branchId) {
      formData.append("branch_id", branchId);
    }
    const response = await api.post("/inventory/products/import_excel/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  downloadTemplate: async () => {
    const response = await api.get("/inventory/products/download_template/", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_import_template.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  getCategories: async () => {
    const response = await api.get<{ id: number; name: string }[]>("/inventory/categories/");
    return response.data;
  },
  getStockHistory: async (productId: string) => {
    const response = await api.get<StockHistoryPoint[]>("/inventory/analytics/stock-history/", { params: { product_id: productId } });
    return response.data;
  },
  createPurchaseOrder: async (data: PurchaseOrder) => {
    const response = await api.post<PurchaseOrder>("/inventory/purchase-orders/", data);
    return response.data;
  },
  getPurchaseOrders: async (filters?: { supplier?: string | number; branch?: string | number; status?: string; product?: string }) => {
    const response = await api.get<PurchaseOrder[]>("/inventory/purchase-orders/", { params: filters });
    return response.data;
  },
  getPurchaseOrdersBySupplier: async (supplierId: string | number) => {
    const response = await api.get<PurchaseOrder[]>("/inventory/purchase-orders/", { params: { supplier: supplierId } });
    return response.data;
  },
  updatePurchaseOrderStatus: async (id: string | number, status: "draft" | "sent" | "received") => {
    const response = await api.post<PurchaseOrder>(`/inventory/purchase-orders/${id}/update-status/`, { status });
    return response.data;
  },
  downloadSupplierOrdersPdf: async (supplierId: string | number, supplierName: string) => {
    const response = await api.get("/inventory/purchase-orders/export-pdf/", {
      params: { supplier: supplierId },
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-history-${supplierName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  createStock: async (data: { product: string | number; branch: string | number; quantity: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>("/inventory/stock-entries/", data);
    return response.data;
  },
};

export const stakeholderService = {
  getSuppliers: async () => {
    const response = await api.get<Supplier[]>("/stakeholders/suppliers/");
    return response.data;
  },
  getCustomers: async () => {
    const response = await api.get<Customer[]>("/stakeholders/customers/");
    return response.data;
  },
  getSupplier: async (id: string) => {
    const response = await api.get<Supplier>(`/stakeholders/suppliers/${id}/`);
    return response.data;
  },
  getCustomer: async (id: string) => {
    const response = await api.get<Customer>(`/stakeholders/customers/${id}/`);
    return response.data;
  },
  createSupplier: async (data: Partial<Supplier>) => {
    const response = await api.post<Supplier>("/stakeholders/suppliers/", data);
    return response.data;
  },
  updateSupplier: async (id: string, data: Partial<Supplier>) => {
    const response = await api.patch<Supplier>(`/stakeholders/suppliers/${id}/`, data);
    return response.data;
  },
  deleteSupplier: async (id: string) => {
    const response = await api.delete(`/stakeholders/suppliers/${id}/`);
    return response.data;
  },
  createCustomer: async (data: Partial<Customer>) => {
    const response = await api.post<Customer>("/stakeholders/customers/", data);
    return response.data;
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const response = await api.patch<Customer>(`/stakeholders/customers/${id}/`, data);
    return response.data;
  },
  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/stakeholders/customers/${id}/`);
    return response.data;
  },
  recordPayment: async (customerId: string, data: { amount: number; note?: string }) => {
    const response = await api.post(`/stakeholders/customers/${customerId}/record-payment/`, data);
    return response.data as { detail: string; customer: import("@/types").Customer };
  },
  getCustomerPayments: async (customerId: string) => {
    const response = await api.get<{ id: number; amount: number; note: string; recorded_by_name: string | null; created_at: string }[]>(
      `/stakeholders/customers/${customerId}/payments/`
    );
    return response.data;
  },
};

export const alertService = {
  getAlerts: async (branch?: string) => {
    const response = await api.get<Alert[]>("/alerts/alerts/", { params: { branch } });
    return response.data;
  },
  resolveAlert: async (id: string | number) => {
    const response = await api.patch<Alert>(`/alerts/alerts/${id}/`, { resolved: true });
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get("/auth/user/");
    return response.data;
  },
  updateProfile: async (data: unknown) => {
    const response = await api.patch("/auth/user/", data);
    return response.data;
  },
  changePassword: async (data: unknown) => {
    const response = await api.post("/auth/password/change/", data);
    return response.data;
  },
};

export const analyticsService = {
  getSalesTrend: async () => {
    const response = await api.get<SalesDataPoint[]>("/sales/analytics/sales-trend/");
    return response.data;
  },
  getTopProducts: async () => {
    const response = await api.get<any[]>("/sales/analytics/top-products/");
    return response.data;
  },
  getCategoryPerformance: async () => {
    const response = await api.get<any[]>("/sales/analytics/category-performance/");
    return response.data;
  },
  getStockForecast: async (sku?: string) => {
    const response = await api.get<any>("/inventory/analytics/stock-forecast/", { params: { sku } });
    return response.data;
  },
  getAiInsights: async () => {
    const response = await api.get<any[]>("/inventory/analytics/ai-insights/");
    return response.data;
  },
  getDashboardSummary: async () => {
    const response = await api.get<{
      totalProducts: number;
      stockValue: number;
      lowStockItems: number;
      todaySales: number;
      salesTrend: number;
    }>("/inventory/analytics/dashboard-summary/");
    return response.data;
  },
};

export const branchService = {
  getBranches: async () => {
    const response = await api.get<Branch[]>("/inventory/analytics/branches/");
    return response.data;
  },
  getBranch: async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>(`/inventory/analytics/branches/${id}/`);
    return response.data;
  },
  createBranch: async (data: Partial<Branch>) => {
    const response = await api.post<Branch>("/inventory/branches/", data);
    return response.data;
  },
  updateBranch: async (id: string | number, data: Partial<Branch>) => {
    const response = await api.patch<Branch>(`/inventory/branches/${id}/`, data);
    return response.data;
  },
  deleteBranch: async (id: string | number) => {
    const response = await api.delete(`/inventory/branches/${id}/`);
    return response.data;
  },
};

// alias for shop naming
export const shopService = branchService;

export const salesService = {
  createSale: async (data: {
    branch: number | string;
    customer: number | string | null;
    total_amount: number;
    items: {
      product: number | string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[];
  }) => {
    const response = await api.post("/sales/sales/", data);
    return response.data;
  },
  getSales: async () => {
    const response = await api.get<any[]>("/sales/sales/");
    return response.data;
  },
};
