import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Lazy load pages
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Products = lazy(() => import('@/pages/inventory/Products'));
const ProductCreate = lazy(() => import('@/pages/inventory/ProductCreate'));
const ProductDetail = lazy(() => import('@/pages/inventory/ProductDetail'));
const ProductEdit = lazy(() => import('@/pages/inventory/ProductEdit'));
const Categories = lazy(() => import('@/pages/inventory/Categories'));
const Suppliers = lazy(() => import('@/pages/inventory/Suppliers'));
const StockIn = lazy(() => import('@/pages/inventory/StockIn'));
const StockOut = lazy(() => import('@/pages/inventory/StockOut'));
const StockHistory = lazy(() => import('@/pages/inventory/StockHistory'));
const Sales = lazy(() => import('@/pages/sales/Sales'));
const CreateSale = lazy(() => import('@/pages/sales/CreateSale'));
const SaleDetail = lazy(() => import('@/pages/sales/SaleDetail'));
const Receipt = lazy(() => import('@/pages/sales/Receipt'));
const Employees = lazy(() => import('@/pages/employees/Employees'));
const EmployeeCreate = lazy(() => import('@/pages/employees/EmployeeCreate'));
const EmployeeDetail = lazy(() => import('@/pages/employees/EmployeeDetail'));
const EmployeeEdit = lazy(() => import('@/pages/employees/EmployeeEdit'));
const Attendance = lazy(() => import('@/pages/attendance/Attendance'));
const MyAttendance = lazy(() => import('@/pages/attendance/MyAttendance'));
const AttendanceHistory = lazy(() => import('@/pages/attendance/AttendanceHistory'));
const AttendanceReportPage = lazy(() => import('@/pages/attendance/AttendanceReport'));
const InventoryReport = lazy(() => import('@/pages/reports/InventoryReport'));
const SalesReport = lazy(() => import('@/pages/reports/SalesReport'));
const ReportAttendance = lazy(() => import('@/pages/reports/ReportAttendance'));
const Profile = lazy(() => import('@/pages/settings/Profile'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [{ index: true, element: <Suspense fallback={<div>Loading...</div>}><Login /></Suspense> }]
  },
  {
    path: '/forgot-password',
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [{ index: true, element: <Suspense fallback={<div>Loading...</div>}><ForgotPassword /></Suspense> }]
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense> },
      { path: 'inventory/products', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><Products /></Suspense></RoleRoute> },
      { path: 'inventory/products/create', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><ProductCreate /></Suspense></RoleRoute> },
      { path: 'inventory/products/:id', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><ProductDetail /></Suspense></RoleRoute> },
      { path: 'inventory/products/:id/edit', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><ProductEdit /></Suspense></RoleRoute> },
      { path: 'inventory/categories', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><Categories /></Suspense></RoleRoute> },
      { path: 'inventory/suppliers', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><Suppliers /></Suspense></RoleRoute> },
      { path: 'inventory/stock-in', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><StockIn /></Suspense></RoleRoute> },
      { path: 'inventory/stock-out', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><StockOut /></Suspense></RoleRoute> },
      { path: 'inventory/stock-history', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><StockHistory /></Suspense></RoleRoute> },
      { path: 'sales', element: <RoleRoute allowedRoles={['admin', 'cashier', 'owner']}><Suspense fallback={<div>Loading...</div>}><Sales /></Suspense></RoleRoute> },
      { path: 'sales/new', element: <RoleRoute allowedRoles={['admin', 'cashier']}><Suspense fallback={<div>Loading...</div>}><CreateSale /></Suspense></RoleRoute> },
      { path: 'sales/receipt/:id', element: <Suspense fallback={<div>Loading...</div>}><Receipt /></Suspense> },
      { path: 'sales/:id', element: <RoleRoute allowedRoles={['admin', 'cashier', 'owner']}><Suspense fallback={<div>Loading...</div>}><SaleDetail /></Suspense></RoleRoute> },
      { path: 'employees', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><Employees /></Suspense></RoleRoute> },
      { path: 'employees/create', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><EmployeeCreate /></Suspense></RoleRoute> },
      { path: 'employees/:id', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><EmployeeDetail /></Suspense></RoleRoute> },
      { path: 'employees/:id/edit', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><EmployeeEdit /></Suspense></RoleRoute> },
      { path: 'attendance', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><Attendance /></Suspense></RoleRoute> },
      { path: 'attendance/my', element: <RoleRoute allowedRoles={['admin', 'cashier']}><Suspense fallback={<div>Loading...</div>}><MyAttendance /></Suspense></RoleRoute> },
      { path: 'attendance/history', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><AttendanceHistory /></Suspense></RoleRoute> },
      { path: 'attendance/report', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><AttendanceReportPage /></Suspense></RoleRoute> },
      { path: 'reports/inventory', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><InventoryReport /></Suspense></RoleRoute> },
      { path: 'reports/sales', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><SalesReport /></Suspense></RoleRoute> },
      { path: 'reports/attendance', element: <RoleRoute allowedRoles={['admin', 'owner']}><Suspense fallback={<div>Loading...</div>}><ReportAttendance /></Suspense></RoleRoute> },
      { path: 'profile', element: <Suspense fallback={<div>Loading...</div>}><Profile /></Suspense> },
      { path: 'settings', element: <RoleRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><Settings /></Suspense></RoleRoute> },
      { path: '*', element: <Suspense fallback={<div>Loading...</div>}><NotFound /></Suspense> }
    ]
  }
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
