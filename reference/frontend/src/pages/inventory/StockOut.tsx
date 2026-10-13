import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useInventory } from '@/contexts/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StockOut() {
  const navigate = useNavigate();

  const {
    products,
    addStockOut,
  } = useInventory();

  const { user } = useAuth();

  const [selectedProduct, setSelectedProduct] =
    useState<number | ''>('');

  const [quantity, setQuantity] =
    useState<number | ''>('');

  const [reason, setReason] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const productOptions = products
    .filter((product) => product.status === 'aktif')
    .map((product) => ({
      value: product.id,
      label: `${product.name} (Stok: ${product.stock})`,
    }));

  const reasonOptions = [
    {
      value: 'Rusak',
      label: 'Rusak',
    },
    {
      value: 'Pemakaian Internal',
      label: 'Pemakaian Internal',
    },
    {
      value: 'Retur',
      label: 'Retur',
    },
    {
      value: 'Lainnya',
      label: 'Lainnya',
    },
  ];

  const product = products.find(
    (item) => item.id === selectedProduct
  );

  const currentStock =
    product?.stock ?? 0;

  const remainingStock =
    quantity !== ''
      ? currentStock - Number(quantity)
      : currentStock;

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      selectedProduct === '' ||
      quantity === '' ||
      !reason
    ) {
      toast.error(
        'Mohon lengkapi produk, jumlah, dan alasan'
      );
      return;
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      toast.error(
        'Jumlah harus lebih dari 0'
      );
      return;
    }

    if (qty > currentStock) {
      toast.error(
        'Jumlah melebihi stok yang tersedia'
      );
      return;
    }

    const success = addStockOut({
      date: new Date()
        .toISOString()
        .slice(0, 10),
      productId: selectedProduct,
      quantity: qty,
      reason,
      notes: notes.trim(),
      reference: `OUT-${Date.now()}`,
      userName:
        user?.name ?? 'Administrator',
    });

    if (!success) {
      toast.error(
        'Pengeluaran stok gagal disimpan'
      );
      return;
    }

    toast.success(
      'Pengeluaran stok berhasil disimpan'
    );

    navigate('/inventory/stock-history');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Stok Keluar"
        subtitle="Penyesuaian pengurangan stok barang"
      />

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Select
            label="Pilih Produk"
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                Number(e.target.value) || ''
              )
            }
            options={productOptions}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah Keluar"
              type="number"
              min="1"
              max={currentStock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Number(e.target.value) || ''
                )
              }
              required
            />

            <Select
              label="Alasan"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              options={reasonOptions}
              required
            />
          </div>

          {selectedProduct !== '' && (
            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center text-sm border border-gray-100">
              <div className="text-gray-600">
                <span className="block text-xs text-gray-500 mb-1">
                  Stok Saat Ini
                </span>

                <span className="font-semibold">
                  {currentStock}
                </span>
              </div>

              <div className="text-gray-400">
                →
              </div>

              <div
                className={
                  remainingStock < 0
                    ? 'text-red-600'
                    : 'text-indigo-600'
                }
              >
                <span className="block text-xs text-gray-500 mb-1">
                  Stok Sisa
                </span>

                <span className="font-semibold">
                  {remainingStock}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Catatan
            </label>

            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              rows={3}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Tambahkan catatan jika perlu..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                navigate(
                  '/inventory/stock-history'
                )
              }
            >
              Batal
            </Button>

            <Button
              variant="primary"
              type="submit"
              leftIcon={Save}
            >
              Simpan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}