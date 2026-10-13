import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profil berhasil diperbarui');
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    toast.success('Password berhasil diubah');
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Profil Saya" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.position}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              Role: {user?.role}
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card title="Informasi Profil">
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <Input 
                label="Nama Lengkap" 
                value={profileForm.name}
                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Email" 
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Nomor Telepon" 
                value={profileForm.phone}
                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              
              <div className="pt-4 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                    <Button type="submit">
                      Simpan Perubahan
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profil
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card title="Ubah Password">
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <Input 
                label="Password Lama" 
                type="password"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                required
              />
              <Input 
                label="Password Baru" 
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
              <Input 
                label="Konfirmasi Password Baru" 
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
              
              <div className="pt-4 flex justify-end">
                <Button type="submit">
                  Ubah Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
