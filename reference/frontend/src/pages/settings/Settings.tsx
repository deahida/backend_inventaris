import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function Settings() {
  const [storeForm, setStoreForm] = useState({
    name: 'PRO.COM',
    address: 'Jl. Merdeka No. 123, Jakarta',
    phone: '021-5551234',
    email: 'info@procom.com',
  });

  const [prefForm, setPrefForm] = useState({
    currency: 'IDR - Rupiah',
    language: 'Indonesia',
  });

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informasi toko berhasil disimpan');
  };

  const handlePrefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Preferensi berhasil disimpan');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Pengaturan Sistem" />
      
      <div className="space-y-6">
        <Card title="Informasi Toko">
          <form onSubmit={handleStoreSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nama Toko" 
                value={storeForm.name}
                onChange={e => setStoreForm({...storeForm, name: e.target.value})}
                required
              />
              <Input 
                label="Email" 
                type="email"
                value={storeForm.email}
                onChange={e => setStoreForm({...storeForm, email: e.target.value})}
                required
              />
              <Input 
                label="Telepon" 
                value={storeForm.phone}
                onChange={e => setStoreForm({...storeForm, phone: e.target.value})}
                required
              />
              <div className="md:col-span-2">
                <Input 
                  label="Alamat Toko" 
                  value={storeForm.address}
                  onChange={e => setStoreForm({...storeForm, address: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit">
                Simpan Informasi
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Preferensi">
          <form onSubmit={handlePrefSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Mata Uang" 
                value={prefForm.currency}
                readOnly
                className="bg-gray-50"
                helperText="Mata uang default untuk seluruh sistem"
              />
              <Select 
                label="Bahasa"
                value={prefForm.language}
                onChange={e => setPrefForm({...prefForm, language: e.target.value})}
                options={[
                  { value: 'Indonesia', label: 'Bahasa Indonesia' },
                ]}
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit">
                Simpan Preferensi
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
