import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import toast from 'react-hot-toast';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { mockEmployees } from '@/mock/employees';

type EmployeeStatus = 'aktif' | 'nonaktif';

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const numericId = Number(id);
  const employee = Number.isNaN(numericId)
    ? undefined
    : mockEmployees.find(e => e.id === numericId);

  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId ?? '',
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    position: employee?.position ?? 'Kasir',
    address: employee?.address ?? '',
    joinDate: employee?.joinDate ?? '',
    status: (employee?.status ?? 'aktif') as EmployeeStatus,
  });

  if (!employee) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">Karyawan tidak ditemukan.</p>
      <Button onClick={() => navigate('/employees')}>
        Kembali ke Daftar
      </Button>
    </div>
  );
}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Karyawan berhasil diperbarui');
    navigate('/employees');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Edit Karyawan" />
      
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="ID Karyawan" 
              value={formData.employeeId} 
              readOnly 
              className="bg-gray-50"
            />
            <Input 
              label="Nama" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Email" 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input 
              label="Telepon" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Select 
              label="Jabatan"
              value={formData.position}
              onChange={e => setFormData({...formData, position: e.target.value})}
              options={[
                { value: 'Administrator', label: 'Administrator' },
                { value: 'Kasir', label: 'Kasir' },
                { value: 'Pemilik', label: 'Pemilik' }
              ]}
            />
            <Input 
              label="Tanggal Bergabung" 
              type="date"
              value={formData.joinDate}
              onChange={e => setFormData({...formData, joinDate: e.target.value})}
              required
            />
            <Select 
              label="Status"
              value={formData.status}
              onChange={e =>
                setFormData({
                  ...formData,
                  status: e.target.value as EmployeeStatus,
                })
              }
              options={[
                { value: 'aktif', label: 'Aktif' },
                { value: 'nonaktif', label: 'Nonaktif' }
              ]}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Alamat</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
              Batal
            </Button>
            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
