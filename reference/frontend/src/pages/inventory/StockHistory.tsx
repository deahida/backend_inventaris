import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useInventory } from '@/contexts/useInventory';
import { formatDate } from '@/utils';

export default function StockHistory() {
  const {
    products,
    stockTransactions,
  } = useInventory();

  const [startDate, setStartDate] =
    useState('');

  const [endDate, setEndDate] =
    useState('');

  const [productId, setProductId] =
    useState<number | ''>('');

  const [type, setType] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(10);

  const productOptions = useMemo(
    () => [
      {
        value: '',
        label: 'Semua Produk',
      },
      ...products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    ],
    [products]
  );

  const filtered = useMemo(() => {
    return [...stockTransactions]
      .filter((item) => {
        if (
          productId !== '' &&
          item.productId !== productId
        ) {
          return false;
        }

        if (
          type &&
          item.type !== type
        ) {
          return false;
        }

        const itemDate =
          item.date.slice(0, 10);

        if (
          startDate &&
          itemDate < startDate
        ) {
          return false;
        }

        if (
          endDate &&
          itemDate > endDate
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateDifference =
          new Date(b.date).getTime() -
          new Date(a.date).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return b.id - a.id;
      });
  }, [
    stockTransactions,
    productId,
    type,
    startDate,
    endDate,
  ]);


  const totalPages = Math.ceil(
    filtered.length / perPage
  );

  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );


  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Stok"
        subtitle="Mutasi barang masuk dan keluar"
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          <Input
            label="Tanggal Akhir"
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

          <Select
            label="Produk"
            value={productId}
            onChange={(e) =>
              setProductId(
                Number(e.target.value) || ''
              )
            }
            options={productOptions}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Tipe
            </label>

            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
            >
              <option value="">
                Semua
              </option>

              <option value="masuk">
                Masuk
              </option>

              <option value="keluar">
                Keluar
              </option>

              <option value="penjualan">
                Penjualan
              </option>

              <option value="penyesuaian">
                Penyesuaian
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
              <tr>
                <th className="px-4 py-3">
                  Tanggal
                </th>

                <th className="px-4 py-3">
                  Produk
                </th>

                <th className="px-4 py-3">
                  Tipe
                </th>

                <th className="px-4 py-3 text-right">
                  Jumlah
                </th>

                <th className="px-4 py-3">
                  Referensi
                </th>

                <th className="px-4 py-3">
                  User
                </th>

                <th className="px-4 py-3 text-right">
                  Sblm
                </th>

                <th className="px-4 py-3 text-right">
                  Ssdh
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginated.length > 0 ? (
                paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {formatDate(row.date)}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {row.productName}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={row.type}
                      />
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        row.quantity > 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {row.quantity > 0
                        ? '+'
                        : ''}
                      {row.quantity}
                    </td>

                    <td className="px-4 py-3">
                      {row.reference}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {row.userName}
                    </td>

                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.stockBefore}
                    </td>

                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.stockAfter}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada data
                    riwayat stok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            total={filtered.length}
          />
        </div>
      </Card>
    </div>
  );
}