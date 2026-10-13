import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { mockEmployees } from '@/mock/employees';
import type { Employee } from '@/types';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchPosition = positionFilter === 'Semua' || emp.position === positionFilter;
      const matchStatus = statusFilter === 'Semua' || emp.status === statusFilter;
      return matchSearch && matchPosition && matchStatus;
    });
  }, [employees, search, positionFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = () => {
    if (deleteId) {
      setEmployees(employees.filter(e => e.id !== deleteId));
      toast.success('Karyawan berhasil dihapus');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Daftar Karyawan" 
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/employees/create')}>
            Tambah Karyawan
          </Button>
        }
      />
      
      <Card>
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Cari karyawan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={positionFilter} 
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="Semua">Semua Jabatan</option>
              <option value="Administrator">Administrator</option>
              <option value="Kasir">Kasir</option>
              <option value="Pemilik">Pemilik</option>
            </select>
            <select 
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{emp.email}</div>
                    <div>{emp.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${emp.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${emp.id}/edit`)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(emp.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onPageChange={setCurrentPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            total={filteredData.length}
          />
        </div>
      </Card>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />
    </div>
  );
}
