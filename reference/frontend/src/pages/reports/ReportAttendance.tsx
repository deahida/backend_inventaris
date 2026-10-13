import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, FileSpreadsheet, Users, UserCheck, Clock, UserX, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

import { mockAttendance } from '@/mock/attendance';
import { mockEmployees } from '@/mock/employees';
import { getCurrentMonthStr } from '@/utils/formatters';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#ef4444'];

interface EmployeeSummary {
  name: string;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
  total: number;
}

export default function ReportAttendance() {
  const [month, setMonth] = useState(getCurrentMonthStr());
  const [employeeId, setEmployeeId] = useState<number | 'Semua'>('Semua');

  const filteredData = useMemo(() => {
    return mockAttendance.filter(a => {
      const matchMonth = a.date.startsWith(month);
      const matchEmp = employeeId === 'Semua' || a.employeeId === employeeId;
      return matchMonth && matchEmp;
    });
  }, [month, employeeId]);

  const stats = useMemo(() => {
    return {
      total: employeeId === 'Semua' ? mockEmployees.length : 1,
      hadir: filteredData.filter(a => a.status === 'hadir').length,
      terlambat: filteredData.filter(a => a.status === 'terlambat').length,
      izin: filteredData.filter(a => a.status === 'izin').length,
      sakit: filteredData.filter(a => a.status === 'sakit').length,
      alpha: filteredData.filter(a => a.status === 'alpha').length,
    };
  }, [filteredData, employeeId]);

  const pieData = [
    { name: 'Hadir', value: stats.hadir },
    { name: 'Terlambat', value: stats.terlambat },
    { name: 'Izin', value: stats.izin },
    { name: 'Sakit', value: stats.sakit },
    { name: 'Alpha', value: stats.alpha },
  ].filter(d => d.value > 0);

  const employeeSummary = useMemo(() => {
    const summary: Record<number, EmployeeSummary> = {};
    mockEmployees.forEach(emp => {
      if (employeeId !== 'Semua' && emp.id !== employeeId) return;
      
      summary[emp.id] = {
        name: emp.name,
        hadir: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
        total: 0
      };
    });

    filteredData.forEach(a => {
      if (summary[a.employeeId]) {
        summary[a.employeeId][a.status as keyof typeof summary[typeof a.employeeId]]++;
        summary[a.employeeId].total++;
      }
    });

    return Object.values(summary).filter(s => s.total > 0);
  }, [filteredData, employeeId]);

  const handleExport = (type: string) => {
    toast.success(`Berhasil mengekspor data ke ${type}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Kehadiran Karyawan" 
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
        <input 
          type="month"
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <select 
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={employeeId} 
          onChange={e => {
            const val = e.target.value;
            setEmployeeId(val === 'Semua' ? 'Semua' : Number(val));
          }}
        >
          <option value="Semua">Semua Karyawan</option>
          {mockEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Karyawan" value={stats.total} icon={Users} color="indigo" />
        <StatCard title="Hadir" value={stats.hadir} icon={UserCheck} color="emerald" />
        <StatCard title="Terlambat" value={stats.terlambat} icon={Clock} color="amber" />
        <StatCard title="Izin" value={stats.izin} icon={Users} color="blue" />
        <StatCard title="Sakit" value={stats.sakit} icon={AlertCircle} color="indigo" />
        <StatCard title="Alpha" value={stats.alpha} icon={UserX} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Distribusi Kehadiran" className="h-96 p-4 lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Detail Per Karyawan" className="lg:col-span-2">
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Terlambat</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sakit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeSummary.map((emp, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{emp.hadir}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{emp.terlambat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{emp.izin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{emp.sakit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{emp.alpha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
