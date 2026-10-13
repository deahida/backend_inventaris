import React, {
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router';

import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

import {
  Search,
  Eye,
  Plus,
} from 'lucide-react';

import {
  formatCurrency,
  formatDate,
} from '@/utils';

import { useInventory } from '@/contexts/useInventory';

export default function Sales() {
  const {
    sales,
  } = useInventory();

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(10);

  /*
   * ==========================================================
   * FILTER
   * ==========================================================
   */

  const filtered =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return sales
        .filter((sale) => {
          if (
            keyword &&
            !sale.invoice
              .toLowerCase()
              .includes(keyword)
          ) {
            return false;
          }

          if (
            status &&
            sale.status
              .toLowerCase() !==
              status.toLowerCase()
          ) {
            return false;
          }

          return true;
        })
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );
    }, [
      sales,
      search,
      status,
    ]);

  /*
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const totalPages =
    Math.ceil(
      filtered.length /
        perPage
    );

  const paginated =
    filtered.slice(
      (currentPage - 1) *
        perPage,
      currentPage *
        perPage
    );

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Penjualan"
        subtitle="Daftar seluruh transaksi penjualan"
        action={
          <Link to="/sales/new">
            <Button
              variant="primary"
              leftIcon={Plus}
            >
              Penjualan Baru
            </Button>
          </Link>
        }
      />

      <Card>
        {/* FILTER */}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Cari invoice..."
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={status}
              onChange={(e) => {
                setStatus(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <option value="">
                Semua Status
              </option>

              <option value="selesai">
                Selesai
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="dibatalkan">
                Dibatalkan
              </option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
              <tr>
                <th className="px-4 py-3">
                  Invoice
                </th>

                <th className="px-4 py-3">
                  Tanggal
                </th>

                <th className="px-4 py-3">
                  Kasir
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-center">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginated.length >
              0 ? (
                paginated.map(
                  (sale) => (
                    <tr
                      key={
                        sale.id
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-indigo-600">
                        <Link
                          to={`/sales/${sale.id}`}
                        >
                          {
                            sale.invoice
                          }
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(
                          sale.date
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {
                          sale.cashierName
                        }
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          sale.total
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={
                            sale.status
                          }
                        />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/sales/${sale.id}`}
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <Eye className="w-5 h-5 inline" />
                        </Link>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada data
                    penjualan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="mt-4">
          <Pagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              setCurrentPage
            }
            perPage={
              perPage
            }
            onPerPageChange={(
              value
            ) => {
              setPerPage(
                value
              );

              setCurrentPage(
                1
              );
            }}
            total={
              filtered.length
            }
          />
        </div>
      </Card>
    </div>
  );
}