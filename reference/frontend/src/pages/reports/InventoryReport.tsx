import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, FileSpreadsheet, Package, AlertTriangle, ArchiveX, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

import { mockProducts } from '@/mock/products';
import { mockCategories } from '@/mock/categories';
import { formatCurrency } from '@/utils/formatters';

export default function InventoryReport() {
  const [categoryId, setCategoryId] = useState<number | 'Semua'>('Semua');

  const filteredProducts = useMemo(() => {
    if (categoryId === 'Semua') return mockProducts;
    return mockProducts.filter(p => p.categoryId === categoryId);
  }, [categoryId]);

  const stats = useMemo(() => {
    const totalProduk = filteredProducts.length;
    const totalStok = filteredProducts.reduce((acc, p) => acc + p.stock, 0);
    const stokMenipis = filteredProducts.filter(p => p.stock <= p.minStock).length;
    const produkNonaktif = filteredProducts.filter(p => p.status === 'nonaktif').length;
    
    return { totalProduk, totalStok, stokMenipis, produkNonaktif };
  }, [filteredProducts]);

  const chartData = useMemo(() => {
    const data: Record<string, { category: string, stock: number }> = {};
    mockCategories.forEach(c => {
      data[c.id] = { category: c.name, stock: 0 };
    });
    mockProducts.forEach(p => {
      if (data[p.categoryId]) {
        data[p.categoryId].stock += p.stock;
      }
    });
    return Object.values(data).filter(d => d.stock > 0);
  }, []);

  const handleExport = (type: string) => {
    toast.success(`Berhasil mengekspor laporan inventori ke ${type}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Inventori" 
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
      
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <select 
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={categoryId} 
          onChange={e => {
            const val = e.target.value;
            setCategoryId(val === 'Semua' ? 'Semua' : Number(val));
          }}
        >
          <option value="Semua">Semua Kategori</option>
          {mockCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={stats.totalProduk} icon={Package} color="indigo" />
        <StatCard title="Total Stok" value={stats.totalStok} icon={Layers} color="emerald" />
        <StatCard title="Stok Menipis" value={stats.stokMenipis} icon={AlertTriangle} color="amber" />
        <StatCard title="Produk Nonaktif" value={stats.produkNonaktif} icon={ArchiveX} color="red" />
      </div>

      <Card title="Distribusi Stok Berdasarkan Kategori" className="h-96 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="stock" fill="#6366f1" name="Jumlah Stok" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Detail Produk">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((prod) => {
                const category = mockCategories.find(c => c.id === prod.categoryId);
                return (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prod.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{prod.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category?.name || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${prod.stock <= prod.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {prod.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(prod.purchasePrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{formatCurrency(prod.sellingPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={prod.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
