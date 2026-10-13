import React, { useState } from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import {
  ArrowLeft,
  Edit2,
  Trash2,
} from 'lucide-react';

import { useInventory } from '@/contexts/useInventory';

import { formatCurrency } from '@/utils';

import { toast } from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    products,
    categories,
    suppliers,
    deleteProduct,
  } = useInventory();

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const product = products.find(
    (item) =>
      item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          Produk tidak ditemukan.
        </p>

        <Button
          onClick={() =>
            navigate(
              '/inventory/products'
            )
          }
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const category = categories.find(
    (item) =>
      item.id === product.categoryId
  );

  const supplier = suppliers.find(
    (item) =>
      item.id === product.supplierId
  );

  const handleDelete = () => {
    deleteProduct(product.id);

    toast.success(
      'Produk berhasil dihapus'
    );

    setIsDeleteOpen(false);

    navigate('/inventory/products');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                '/inventory/products'
              )
            }
            leftIcon={ArrowLeft}
          >
            Kembali
          </Button>

          <PageHeader
            title="Detail Produk"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/inventory/products/${product.id}/edit`
              )
            }
            leftIcon={Edit2}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              setIsDeleteOpen(true)
            }
            leftIcon={Trash2}
          >
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                Informasi Produk
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Kode Produk
                  </p>

                  <p className="font-medium">
                    {product.code}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Nama Produk
                  </p>

                  <p className="font-medium">
                    {product.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Kategori
                  </p>

                  <p className="font-medium">
                    {category?.name || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Supplier
                  </p>

                  <p className="font-medium">
                    {supplier?.name || '-'}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500">
                    Deskripsi
                  </p>

                  <p className="mt-1">
                    {product.description ||
                      '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
              Harga & Stok
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Harga Beli
                </p>

                <p className="font-medium">
                  {formatCurrency(
                    product.purchasePrice
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Harga Jual
                </p>

                <p className="font-medium text-lg text-indigo-600">
                  {formatCurrency(
                    product.sellingPrice
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Stok Saat Ini
                  </p>

                  <p
                    className={`font-medium ${
                      product.stock <=
                      product.minStock
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {product.stock}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Min. Stok
                  </p>

                  <p className="font-medium">
                    {product.minStock}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
              Status
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Kondisi
                </p>

                <StatusBadge
                  status={
                    product.condition
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Status Penjualan
                </p>

                <StatusBadge
                  status={
                    product.status
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() =>
          setIsDeleteOpen(false)
        }
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk ${product.name}?`}
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}