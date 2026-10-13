import type { DashboardStats, AttendanceSummary } from '@/types';
import { mockProducts } from './products';
import { mockSales } from './sales';

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 125500000,
  revenueGrowth: 15.2,
  totalSales: 450,
  salesGrowth: 8.5,
  totalProducts: 25,
  lowStockProducts: 5,
  totalEmployees: 8,
  activeEmployees: 7,
  todaySales: 18750000,
  todayTransactions: 12,
  availableProducts: 22,
};

export interface SalesChartData {
  name: string;
  sales: number;
}

export const mockMonthlySalesData: SalesChartData[] = [
  { name: 'Jan', sales: 85000000 },
  { name: 'Feb', sales: 92000000 },
  { name: 'Mar', sales: 110000000 },
  { name: 'Apr', sales: 95000000 },
  { name: 'Mei', sales: 105000000 },
  { name: 'Jun', sales: 120000000 },
  { name: 'Jul', sales: 115000000 },
  { name: 'Agu', sales: 130000000 },
  { name: 'Sep', sales: 125500000 },
  { name: 'Okt', sales: 0 },
  { name: 'Nov', sales: 0 },
  { name: 'Des', sales: 0 },
];

export interface CategoryChartData {
  name: string;
  value: number;
}

export const mockCategoryDistribution: CategoryChartData[] = [
  { name: 'Laptop', value: 45 },
  { name: 'Desktop / PC', value: 20 },
  { name: 'Monitor', value: 15 },
  { name: 'Aksesoris', value: 10 },
  { name: 'Spare Part', value: 10 },
];

export const mockWeeklySalesData: SalesChartData[] = [
  { name: 'Sen', sales: 12500000 },
  { name: 'Sel', sales: 15200000 },
  { name: 'Rab', sales: 11000000 },
  { name: 'Kam', sales: 18500000 },
  { name: 'Jum', sales: 14000000 },
  { name: 'Sab', sales: 25000000 },
  { name: 'Min', sales: 28000000 },
];

export const mockAttendanceSummary: AttendanceSummary = {
  hadir: 250,
  terlambat: 15,
  izin: 5,
  sakit: 8,
  alpha: 2,
};

export const mockLowStockProducts = mockProducts.filter((p) => p.stock <= p.minStock).slice(0, 5);

export const mockRecentTransactions = mockSales.slice(0, 8);
