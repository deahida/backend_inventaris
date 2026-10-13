import React, {
  useState,
} from 'react';

import { useNavigate } from 'react-router';

import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

import {
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

import { formatCurrency } from '@/utils';

import toast from 'react-hot-toast';

import { useInventory } from '@/contexts/useInventory';

import { useAuth } from '@/contexts/AuthContext';

interface StockInItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function StockIn() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    products,
    suppliers,
    addStockIn,
  } = useInventory();

  const [supplierId, setSupplierId] =
    useState<number | ''>('');

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [reference, setReference] =
    useState('');

  const [items, setItems] =
    useState<StockInItem[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<number | ''>('');

  const [quantity, setQuantity] =
    useState<number | ''>('');

  const [price, setPrice] =
    useState<number | ''>('');

  const supplierOptions =
    suppliers.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
    }));

  const productOptions =
    products.map((product) => ({
      value: product.id,
      label: `${product.code} - ${product.name}`,
    }));

  const total = items.reduce(
    (sum, item) =>
      sum + item.subtotal,
    0
  );

  const resetItemForm = () => {
    setSelectedProduct('');
    setQuantity('');
    setPrice('');
  };

  const handleAddItem = () => {
    if (
      selectedProduct === '' ||
      quantity === '' ||
      price === ''
    ) {
      toast.error(
        'Mohon isi semua field produk.'
      );

      return;
    }

    const quantityNumber =
      Number(quantity);

    const priceNumber =
      Number(price);

    if (
      quantityNumber <= 0
    ) {
      toast.error(
        'Jumlah stok harus lebih dari 0.'
      );

      return;
    }

    if (
      priceNumber < 0
    ) {
      toast.error(
        'Harga beli tidak boleh negatif.'
      );

      return;
    }

    const product =
      products.find(
        (item) =>
          item.id ===
          Number(selectedProduct)
      );

    if (!product) {
      toast.error(
        'Produk tidak ditemukan.'
      );

      return;
    }

    const existingItem =
      items.find(
        (item) =>
          item.productId ===
          product.id
      );

    if (existingItem) {
      toast.error(
        'Produk tersebut sudah ada di daftar stok masuk.'
      );

      return;
    }

    const newItem: StockInItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantityNumber,
      price: priceNumber,
      subtotal:
        quantityNumber *
        priceNumber,
    };

    setItems((currentItems) => [
      ...currentItems,
      newItem,
    ]);

    resetItemForm();
    setIsModalOpen(false);
  };

  const handleRemoveItem = (
    index: number
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      supplierId === ''
    ) {
      toast.error(
        'Supplier wajib dipilih.'
      );

      return;
    }

    if (!date) {
      toast.error(
        'Tanggal wajib diisi.'
      );

      return;
    }

    if (items.length === 0) {
      toast.error(
        'Minimal tambahkan satu produk.'
      );

      return;
    }

    const supplier =
      suppliers.find(
        (item) =>
          item.id ===
          Number(supplierId)
      );

    if (!supplier) {
      toast.error(
        'Supplier tidak ditemukan.'
      );

      return;
    }

    const success =
      addStockIn({
        date,
        supplierId:
          Number(supplierId),
        supplierName:
          supplier.name,
        reference:
          reference.trim(),
        items: items.map(
          (item) => ({
            productId:
              item.productId,
            quantity:
              item.quantity,
            price:
              item.price,
          })
        ),
        userName:
          user?.name ??
          'Administrator',
      });

    if (!success) {
      toast.error(
        'Stok masuk gagal disimpan.'
      );

      return;
    }

    toast.success(
      'Stok masuk berhasil disimpan.'
    );

    navigate(
      '/inventory/stock-history'
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Masuk"
        subtitle="Penerimaan barang dari supplier"
      />

      <form
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Informasi Penerimaan"
          >
            <div className="space-y-4">
              <Select
                label="Supplier"
                value={supplierId}
                onChange={(e) =>
                  setSupplierId(
                    Number(
                      e.target.value
                    ) || ''
                  )
                }
                options={
                  supplierOptions
                }
                required
              />

              <Input
                label="Tanggal"
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
                required
              />

              <Input
                label="Referensi"
                placeholder="No. Surat Jalan / Faktur"
                value={reference}
                onChange={(e) =>
                  setReference(
                    e.target.value
                  )
                }
              />
            </div>
          </Card>

          <Card
            title="Daftar Produk"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={Plus}
                onClick={() =>
                  setIsModalOpen(true)
                }
              >
                Tambah
              </Button>
            }
          >
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada produk
                  yang ditambahkan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">
                          Produk
                        </th>

                        <th className="px-4 py-2">
                          Qty
                        </th>

                        <th className="px-4 py-2">
                          Harga
                        </th>

                        <th className="px-4 py-2">
                          Subtotal
                        </th>

                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {items.map(
                        (
                          item,
                          index
                        ) => (
                          <tr
                            key={`${item.productId}-${index}`}
                          >
                            <td className="px-4 py-2 font-medium">
                              {
                                item.productName
                              }
                            </td>

                            <td className="px-4 py-2">
                              {
                                item.quantity
                              }
                            </td>

                            <td className="px-4 py-2">
                              {formatCurrency(
                                item.price
                              )}
                            </td>

                            <td className="px-4 py-2">
                              {formatCurrency(
                                item.subtotal
                              )}
                            </td>

                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(
                                    index
                                  )
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    <tfoot className="font-semibold bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right"
                        >
                          Total:
                        </td>

                        <td className="px-4 py-2 text-indigo-600">
                          {formatCurrency(
                            total
                          )}
                        </td>

                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetItemForm();
        }}
        title="Tambah Produk"
      >
        <div className="space-y-4">
          <Select
            label="Pilih Produk"
            value={
              selectedProduct
            }
            onChange={(e) =>
              setSelectedProduct(
                Number(
                  e.target.value
                ) || ''
              )
            }
            options={
              productOptions
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Number(
                    e.target.value
                  ) || ''
                )
              }
              required
            />

            <Input
              label="Harga Beli"
              type="number"
              min="0"
              value={price}
              onChange={(e) =>
                setPrice(
                  Number(
                    e.target.value
                  ) || ''
                )
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetItemForm();
              }}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleAddItem}
            >
              Tambah
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}