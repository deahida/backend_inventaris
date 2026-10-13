import React from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-black text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
