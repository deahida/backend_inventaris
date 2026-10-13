import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, FileSpreadsheet, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

import { mockSales } from '@/mock/sales';
import { mockProducts } from '@/mock/products';
import { formatCurrency, getTodayStr } from '@/utils/formatters';

export default function SalesReport() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(getTodayStr());

  const filteredSales = useMemo(() => {
    return mockSales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [startDate, endDate]);

  const stats = useMemo(() => {
    const totalTransaksi = filteredSales.length;
    const totalPendapatan = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const rataRata = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;
    
    return { totalTransaksi, totalPendapatan, rataRata };
  }, [filteredSales]);

  const dailyData = useMemo(() => {
    const data: Record<string, { date: string, total: number }> = {};
    filteredSales.forEach(s => {
      const d = s.date.split('T')[0];
      if (!data[d]) data[d] = { date: d, total: 0 };
      data[d].total += s.total;
    });
    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const data: Record<string, { name: string, qty: number }> = {};
    filteredSales.forEach(s => {
      s.items.forEach(i => {
        if (!data[String(i.productId)]) {
          const p = mockProducts.find(prod => prod.id === i.productId);
          data[String(i.productId)] = { name: p?.name ?? String(i.productId), qty: 0 };
        }
        data[String(i.productId)].qty += i.quantity;
      });
    });
    return Object.values(data).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredSales]);

  const handleExport = (type: string) => {
    toast.success(`Berhasil mengekspor laporan penjualan ke ${type}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Penjualan" 
        action={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<FileText className="w-4 h-4" />} onClick={() => handleExport('PDF')}>
              PDF
            </Button>
            <Button variant="outline" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => handleExport('Excel')}>
              Excel
            </Button>
            <Button leftIcon={<Download className="w-4 h-4" />} onClick={() => handleExport('Cetak')}>
              Cetak
            </Button>
          </div>
        }
      />
      
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Tanggal</label>
          <input 
            type="date"
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input 
            type="date"
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Transaksi" value={stats.totalTransaksi} icon={Activity} color="indigo" />
        <StatCard title="Total Pendapatan" value={formatCurrency(stats.totalPendapatan)} icon={DollarSign} color="emerald" />
        <StatCard title="Rata-rata Transaksi" value={formatCurrency(stats.rataRata)} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tren Penjualan Harian" className="h-96 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => formatCurrency(typeof value === 'number' ? value : Number(value ?? 0))} />
              <Bar dataKey="total" fill="#6366f1" name="Pendapatan" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="5 Produk Terlaris" className="h-96 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <RechartsTooltip />
              <Bar dataKey="qty" fill="#10b981" name="Kuantitas Terjual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
