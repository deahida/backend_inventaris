import React, { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

import { useInventory } from '@/contexts/useInventory';

import { useNavigate } from 'react-router';

import {
  Save,
  ArrowLeft,
} from 'lucide-react';

import { toast } from 'react-hot-toast';

import type {
  ProductCondition,
  ProductStatus,
} from '@/types';

export default function ProductCreate() {
  const navigate = useNavigate();

  const {
    products,
    categories,
    suppliers,
    addProduct,
  } = useInventory();

  const [formData, setFormData] =
    useState<{
      code: string;
      name: string;
      categoryId: string;
      supplierId: string;
      purchasePrice: string;
      sellingPrice: string;
      stock: string;
      minStock: string;
      condition: ProductCondition;
      status: ProductStatus;
    }>({
      code: '',
      name: '',
      categoryId: '',
      supplierId: '',
      purchasePrice: '',
      sellingPrice: '',
      stock: '',
      minStock: '',
      condition: 'baru',
      status: 'aktif',
    });

  const categoryOptions =
    categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));

  const supplierOptions =
    suppliers.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
    }));

  const statusOptions = [
    {
      value: 'aktif',
      label: 'Aktif',
    },
    {
      value: 'nonaktif',
      label: 'Nonaktif',
    },
  ];

  const conditionOptions = [
    {
      value: 'baru',
      label: 'Baru',
    },
    {
      value: 'bekas',
      label: 'Bekas',
    },
  ];

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const code =
      formData.code.trim();

    const name =
      formData.name.trim();

    if (!code || !name) {
      toast.error(
        'Kode dan nama produk wajib diisi.'
      );
      return;
    }

    const categoryId =
      Number(formData.categoryId);

    const supplierId =
      Number(formData.supplierId);

    const purchasePrice =
      Number(formData.purchasePrice);

    const sellingPrice =
      Number(formData.sellingPrice);

    const stock =
      Number(formData.stock);

    const minStock =
      Number(formData.minStock);

    if (!categoryId || !supplierId) {
      toast.error(
        'Kategori dan supplier wajib dipilih.'
      );
      return;
    }

    const categoryExists =
      categories.some(
        (category) =>
          category.id === categoryId
      );

    if (!categoryExists) {
      toast.error(
        'Kategori yang dipilih tidak ditemukan.'
      );
      return;
    }

    const supplierExists =
      suppliers.some(
        (supplier) =>
          supplier.id === supplierId
      );

    if (!supplierExists) {
      toast.error(
        'Supplier yang dipilih tidak ditemukan.'
      );
      return;
    }

    if (
      Number.isNaN(purchasePrice) ||
      Number.isNaN(sellingPrice) ||
      Number.isNaN(stock) ||
      Number.isNaN(minStock)
    ) {
      toast.error(
        'Data harga dan stok harus berupa angka.'
      );
      return;
    }

    if (
      purchasePrice < 0 ||
      sellingPrice < 0 ||
      stock < 0 ||
      minStock < 0
    ) {
      toast.error(
        'Harga dan stok tidak boleh bernilai negatif.'
      );
      return;
    }

    const duplicateCode =
      products.some(
        (product) =>
          product.code
            .toLowerCase() ===
          code.toLowerCase()
      );

    if (duplicateCode) {
      toast.error(
        'Kode produk sudah digunakan.'
      );
      return;
    }

    const newProduct = {
      id: Date.now(),
      code,
      name,
      categoryId,
      supplierId,
      purchasePrice,
      sellingPrice,
      stock,
      minStock,
      condition: formData.condition,
      status: formData.status,
      description: '',
      createdAt:
        new Date().toISOString(),
    };

    addProduct(newProduct);

    toast.success(
      'Produk berhasil ditambahkan'
    );

    navigate('/inventory/products');
  };

  return (
    <div className="space-y-6">
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
          title="Tambah Produk Baru"
        />
      </div>

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informasi Dasar
              </h3>

              <Input
                label="Kode Produk"
                placeholder="PROD-001"
                value={formData.code}
                onChange={(e) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      code: e.target.value,
                    })
                  )
                }
                required
              />

              <Input
                label="Nama Produk"
                placeholder="Masukkan nama produk"
                value={formData.name}
                onChange={(e) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      name: e.target.value,
                    })
                  )
                }
                required
              />

              <Select
                label="Kategori"
                options={categoryOptions}
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      categoryId:
                        e.target.value,
                    })
                  )
                }
                required
              />

              <Select
                label="Supplier"
                options={supplierOptions}
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      supplierId:
                        e.target.value,
                    })
                  )
                }
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Harga & Stok
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Harga Beli"
                  type="number"
                  min="0"
                  value={
                    formData.purchasePrice
                  }
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        purchasePrice:
                          e.target.value,
                      })
                    )
                  }
                  required
                />

                <Input
                  label="Harga Jual"
                  type="number"
                  min="0"
                  value={
                    formData.sellingPrice
                  }
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        sellingPrice:
                          e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stok Awal"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        stock: e.target.value,
                      })
                    )
                  }
                  required
                />

                <Input
                  label="Stok Minimum"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        minStock:
                          e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Kondisi"
                  options={
                    conditionOptions
                  }
                  value={
                    formData.condition
                  }
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        condition:
                          e.target.value as ProductCondition,
                      })
                    )
                  }
                  required
                />

                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        status:
                          e.target.value as ProductStatus,
                      })
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                navigate(
                  '/inventory/products'
                )
              }
            >
              Batal
            </Button>

            <Button
              type="submit"
              leftIcon={Save}
            >
              Simpan Produk
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}