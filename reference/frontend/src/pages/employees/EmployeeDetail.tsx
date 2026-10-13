import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit2, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { mockEmployees } from '@/mock/employees';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const numericId = Number(id);
  const employee = Number.isNaN(numericId)
    ? undefined
    : mockEmployees.find(e => e.id === numericId);

  if (!employee) {
    return <div>Karyawan tidak ditemukan</div>;
  }

  const handleDelete = () => {
    toast.success('Karyawan berhasil dihapus');
    navigate('/employees');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <PageHeader title="Detail Karyawan" className="!mb-0" />
      </div>
      
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User className="w-16 h-16" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-sm text-gray-500">{employee.employeeId}</p>
                </div>
                <StatusBadge status={employee.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jabatan</h3>
                  <p className="mt-1 text-base text-gray-900">{employee.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Bergabung</h3>
                  <p className="mt-1 text-base text-gray-900">{employee.joinDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-base text-gray-900">{employee.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Telepon</h3>
                  <p className="mt-1 text-base text-gray-900">{employee.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Alamat</h3>
                  <p className="mt-1 text-base text-gray-900">{employee.address}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => navigate(`/employees/${employee.id}/edit`)} leftIcon={<Edit2 className="w-4 h-4" />}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setDeleteOpen(true)} leftIcon={<Trash2 className="w-4 h-4" />}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus karyawan ini?"
        variant="danger"
      />
    </div>
  );
}
