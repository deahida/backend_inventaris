// ============================================
// Role & Auth Types
// ============================================
export type Role = 'admin' | 'cashier' | 'owner';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  position: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// Product & Inventory Types
// ============================================
export type ProductCondition = 'baru' | 'bekas' | 'refurbished';
export type ProductStatus = 'aktif' | 'nonaktif';
export type StockTransactionType = 'masuk' | 'keluar' | 'penjualan' | 'penyesuaian';

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson?: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  category?: string;
  supplierId: number;
  supplier?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  condition: ProductCondition;
  status: ProductStatus;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockTransaction {
  id: number;
  date: string;
  productId: number;
  productName: string;
  productCode?: string;
  type: StockTransactionType;
  quantity: number;
  reference: string;
  note: string;
  userId: number;
  userName: string;
  stockBefore: number;
  stockAfter: number;
  purchasePrice?: number;
  createdAt?: string;
}

export interface StockInItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface StockInTransaction {
  id: number;
  date: string;
  supplierId: number;
  supplierName: string;
  reference: string;
  items: StockInItem[];
  total: number;
  userId: number;
  userName: string;
  createdAt: string;
}

// ============================================
// Sales Types
// ============================================
export type SaleStatus = 'selesai' | 'dibatalkan' | 'pending';
export type PaymentMethod = 'tunai' | 'transfer' | 'debit' | 'kartu_kredit';

export interface SaleItem {
  id: number;
  saleId?: number;
  productId: number;
  productCode?: string;
  productName: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice: string;
  date: string;
  cashierId: number;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  paymentAmount: number;
  change: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  customerName?: string;
  note?: string;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
  subtotal: number;
}

// ============================================
// Employee Types
// ============================================
export type EmployeeStatus = 'aktif' | 'nonaktif';

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  role?: string;
  address: string;
  joinDate: string;
  status: EmployeeStatus;
  avatar?: string;
  createdAt?: string;
}

// ============================================
// Attendance Types
// ============================================
export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  note?: string;
  notes?: string;
  createdAt?: string;
}

export interface AttendanceSummary {
  employeeId?: number;
  employeeName?: string;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales?: number;
  todayTransactions?: number;
  totalEmployees: number;
  totalRevenue: number;
  totalSales?: number;
  availableProducts?: number;
  revenueGrowth?: number;
  salesGrowth?: number;
  activeEmployees?: number;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

// ============================================
// Common Types
// ============================================
export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}
