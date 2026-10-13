import React from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router';

import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

import {
  formatCurrency,
  formatDate,
} from '@/utils';

import {
  ArrowLeft,
  Printer,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useInventory } from '@/contexts/useInventory';

export default function SaleDetail() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const {
    sales,
  } = useInventory();

  /*
   * Cari transaksi berdasarkan ID.
   */

  const sale =
    sales.find(
      (item) =>
        item.id ===
        Number(id)
    );

  /*
   * Jika tidak ditemukan.
   */

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Transaksi tidak
          ditemukan
        </h2>

        <Button
          variant="outline"
          onClick={() =>
            navigate(
              '/sales'
            )
          }
          className="mt-4"
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  /*
   * ==========================================================
   * PRINT
   * ==========================================================
   */

  const handlePrint = () => {
    toast.success(
      'Membuka halaman cetak...'
    );

    navigate(
      `/sales/receipt/${sale.id}`
    );
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <PageHeader
          title={`Detail Transaksi ${sale.invoice}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ==================================================
            ITEMS
            ================================================== */}

        <div className="md:col-span-2 space-y-6">
          <Card title="Daftar Produk">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">
                      Produk
                    </th>

                    <th className="px-4 py-2 text-right">
                      Harga
                    </th>

                    <th className="px-4 py-2 text-center">
                      Qty
                    </th>

                    <th className="px-4 py-2 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {sale.items.map(
                    (
                      item
                    ) => (
                      <tr
                        key={`${sale.id}-${item.productId}`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {
                            item.productName
                          }
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            item.quantity
                          }
                        </td>

                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(
                            item.subtotal
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ==================================================
            SUMMARY
            ================================================== */}

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Status Transaksi
                </div>

                <StatusBadge
                  status={
                    sale.status
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Invoice
                </div>

                <div className="font-medium">
                  {
                    sale.invoice
                  }
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Tanggal
                </div>

                <div className="font-medium">
                  {formatDate(
                    sale.date
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Kasir
                </div>

                <div className="font-medium">
                  {
                    sale.cashierName
                  }
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Metode Pembayaran
                </div>

                <div className="font-medium capitalize">
                  {
                    sale.paymentMethod
                  }
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  {formatCurrency(
                    sale.subtotal
                  )}
                </span>
              </div>

              {sale.discount >
                0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Diskon
                  </span>

                  <span>
                    -
                    {formatCurrency(
                      sale.discount
                    )}
                  </span>
                </div>
              )}

              {sale.tax >
                0 && (
                <div className="flex justify-between text-gray-600">
                  <span>
                    Pajak
                  </span>

                  <span>
                    {formatCurrency(
                      sale.tax
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t mt-2">
                <span>
                  Total
                </span>

                <span>
                  {formatCurrency(
                    sale.total
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 mt-2">
                <span>
                  Dibayar
                </span>

                <span>
                  {formatCurrency(
                    sale.paymentAmount
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Kembali
                </span>

                <span>
                  {formatCurrency(
                    sale.change
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={Printer}
                onClick={
                  handlePrint
                }
              >
                Cetak Struk
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}