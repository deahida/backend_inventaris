import React, { useState } from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

import { useInventory } from '@/contexts/useInventory';

import {
  Save,
  ArrowLeft,
} from 'lucide-react';

import { toast } from 'react-hot-toast';

import type {
  ProductCondition,
  ProductStatus,
} from '@/types';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    products,
    categories,
    suppliers,
    updateProduct,
  } = useInventory();

  const product = products.find(
    (item) =>
      item.id === Number(id)
  );

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
    }>(() => ({
      code: product?.code ?? '',
      name: product?.name ?? '',
      categoryId:
        product?.categoryId?.toString() ??
        '',
      supplierId:
        product?.supplierId?.toString() ??
        '',
      purchasePrice:
        product?.purchasePrice?.toString() ??
        '',
      sellingPrice:
        product?.sellingPrice?.toString() ??
        '',
      stock:
        product?.stock?.toString() ?? '',
      minStock:
        product?.minStock?.toString() ?? '',
      condition:
        product?.condition ?? 'baru',
      status:
        product?.status ?? 'aktif',
    }));

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
        (item) =>
          item.id !== product.id &&
          item.code
            .toLowerCase() ===
            code.toLowerCase()
      );

    if (duplicateCode) {
      toast.error(
        'Kode produk sudah digunakan oleh produk lain.'
      );
      return;
    }

    updateProduct({
      ...product,
      code,
      name,
      categoryId,
      supplierId,
      purchasePrice,
      sellingPrice,
      stock,
      minStock,
      condition:
        formData.condition,
      status:
        formData.status,
    });

    toast.success(
      'Produk berhasil diperbarui'
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

        <PageHeader title="Edit Produk" />
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
                  label="Stok"
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}