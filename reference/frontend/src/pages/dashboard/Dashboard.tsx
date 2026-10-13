import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Package, AlertTriangle, TrendingUp, Users, ShoppingCart, Activity } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useNavigate } from 'react-router';
import {
  mockDashboardStats, mockMonthlySalesData, mockCategoryDistribution,
  mockLowStockProducts, mockRecentTransactions,
} from '@/mock/dashboard';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Selamat datang kembali, <span className="font-medium text-gray-700">{user.name}</span>
          </p>
        </div>
        {role === 'cashier' && (
          <Button onClick={() => navigate('/sales/new')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Transaksi Baru
          </Button>
        )}
      </div>

      {/* ADMIN VIEW */}
      {role === 'admin' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Produk"
              value={String(mockDashboardStats.totalProducts)}
              icon={Package}
              color="indigo"
            />
            <StatCard
              title="Penjualan Hari Ini"
              value={formatCurrency(mockDashboardStats.todaySales ?? 0)}
              icon={TrendingUp}
              color="emerald"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Transaksi Hari Ini"
              value={String(mockDashboardStats.todayTransactions ?? 0)}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Total Karyawan"
              value={String(mockDashboardStats.totalEmployees)}
              icon={Users}
              color="indigo"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Penjualan Bulanan" subtitle="Grafik penjualan 12 bulan terakhir">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockMonthlySalesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v / 1000000}M`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="sales" name="Penjualan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Low Stock Table */}
            <Card title="Stok Menipis" subtitle="Produk yang perlu segera diisi ulang">
              {mockLowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Tidak ada produk dengan stok rendah.</p>
              ) : (
                <div className="overflow-x-auto -mx-6 -mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockLowStockProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-500 font-mono text-xs">{p.code}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-6 py-3 text-red-600 font-bold">{p.stock}</td>
                          <td className="px-6 py-3 text-gray-500">{p.minStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card title="Transaksi Terbaru" subtitle="Daftar transaksi yang baru saja dilakukan">
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faktur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockRecentTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{t.invoice}</td>
                      <td className="px-6 py-3 text-gray-600">{t.cashierName}</td>
                      <td className="px-6 py-3 uppercase text-xs text-gray-500">{t.paymentMethod}</td>
                      <td className="px-6 py-3 font-medium">{formatCurrency(t.total)}</td>
                      <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* CASHIER VIEW */}
      {role === 'cashier' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Penjualan Hari Ini"
              value={formatCurrency(mockDashboardStats.todaySales ?? 0)}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Transaksi"
              value={String(mockDashboardStats.todayTransactions ?? 0)}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Produk Tersedia"
              value={String(mockDashboardStats.availableProducts ?? 0)}
              icon={Package}
              color="indigo"
            />
            <StatCard title="Status Kehadiran" value="Hadir" icon={Activity} color="emerald" />
          </div>

          <Card title="Transaksi Hari Ini">
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faktur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockRecentTransactions.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{t.invoice}</td>
                      <td className="px-6 py-3 text-gray-500">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-3 font-medium">{formatCurrency(t.total)}</td>
                      <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* OWNER VIEW */}
      {role === 'owner' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Pendapatan"
              value={formatCurrency(mockDashboardStats.totalRevenue)}
              icon={TrendingUp}
              color="emerald"
              trend={{ value: mockDashboardStats.revenueGrowth ?? 0, isPositive: true }}
            />
            <StatCard
              title="Total Produk"
              value={String(mockDashboardStats.totalProducts)}
              icon={Package}
              color="indigo"
            />
            <StatCard
              title="Stok Menipis"
              value={String(mockDashboardStats.lowStockProducts)}
              icon={AlertTriangle}
              color="amber"
            />
            <StatCard
              title="Total Karyawan"
              value={String(mockDashboardStats.totalEmployees)}
              icon={Users}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Grafik Penjualan Bulanan">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockMonthlySalesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v / 1000000}M`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Penjualan"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Distribusi Kategori">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockCategoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {mockCategoryDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Produk`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="Laporan Transaksi Terbaru">
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faktur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockRecentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{t.invoice}</td>
                      <td className="px-6 py-3 text-gray-500">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-3 text-gray-600">{t.cashierName}</td>
                      <td className="px-6 py-3 uppercase text-xs text-gray-500">{t.paymentMethod}</td>
                      <td className="px-6 py-3 font-medium">{formatCurrency(t.total)}</td>
                      <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
