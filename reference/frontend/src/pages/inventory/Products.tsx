import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { formatCurrency } from '@/utils';
import { toast } from 'react-hot-toast';
import { useInventory } from '@/contexts/useInventory';

export default function Products() {
  const navigate = useNavigate();

  const {
    products,
    categories,
    deleteProduct,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<number>(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const filteredProducts = products.filter((product) => {
    const keyword = search.trim().toLowerCase();

    const matchSearch =
      product.name
        .toLowerCase()
        .includes(keyword) ||
      product.code
        .toLowerCase()
        .includes(keyword);

    const matchCategory =
      categoryFilter === 0 ||
      product.categoryId === categoryFilter;

    return matchSearch && matchCategory;
  });

  const total = filteredProducts.length;

  const totalPages =
    total === 0
      ? 1
      : Math.ceil(total / perPage);

  const paginatedProducts =
    filteredProducts.slice(
      (page - 1) * perPage,
      page * perPage
    );

  const lowStockCount = products.filter(
    (product) =>
      product.stock <= product.minStock &&
      product.status === 'aktif'
  ).length;

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    deleteProduct(deleteId);

    toast.success(
      'Produk berhasil dihapus'
    );

    setDeleteId(null);

    const remainingProducts =
      filteredProducts.length - 1;

    const newTotalPages =
      remainingProducts === 0
        ? 1
        : Math.ceil(
            remainingProducts / perPage
          );

    if (page > newTotalPages) {
      setPage(newTotalPages);
    }
  };

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (
    value: number
  ) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handlePerPageChange = (
    value: number
  ) => {
    setPerPage(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Produk"
        subtitle={`${products.length} produk terdaftar`}
        action={
          <Button
            onClick={() =>
              navigate(
                '/inventory/products/create'
              )
            }
            leftIcon={Plus}
          >
            Tambah Produk
          </Button>
        }
      />

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />

          <p className="text-sm text-amber-800">
            <strong>
              {lowStockCount} produk
            </strong>{' '}
            memiliki stok di bawah batas
            minimum.
          </p>
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Cari nama atau kode produk..."
              value={search}
              onChange={(e) =>
                handleSearchChange(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              handleCategoryChange(
                Number(e.target.value)
              )
            }
            className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value={0}>
              Semua Kategori
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  Kode
                </th>

                <th className="px-4 py-3">
                  Produk
                </th>

                <th className="px-4 py-3">
                  Kategori
                </th>

                <th className="px-4 py-3 text-right">
                  Harga Jual
                </th>

                <th className="px-4 py-3 text-center">
                  Stok
                </th>

                <th className="px-4 py-3 text-center">
                  Kondisi
                </th>

                <th className="px-4 py-3 text-center">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map(
                (product) => {
                  const isLowStock =
                    product.stock <=
                    product.minStock;

                  const category =
                    categories.find(
                      (item) =>
                        item.id ===
                        product.categoryId
                    );

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {product.code}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                        <div>
                          {product.name}
                        </div>

                        {product.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {product.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {category?.name || '-'}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(
                          product.sellingPrice
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            isLowStock
                              ? 'text-red-600 font-bold'
                              : 'text-gray-700'
                          }
                        >
                          {product.stock}
                        </span>

                        {isLowStock && (
                          <span className="ml-1 text-xs text-red-500">
                            (min{' '}
                            {product.minStock})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={
                            product.condition
                          }
                        />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={
                            product.status
                          }
                        />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/inventory/products/${product.id}`
                              )
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/inventory/products/${product.id}/edit`
                              )
                            }
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                product.id
                              )
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}

              {paginatedProducts.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />

                    <p>
                      Tidak ada produk
                      ditemukan.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={
              handlePerPageChange
            }
            total={total}
          />
        </div>
      </Card>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() =>
          setDeleteId(null)
        }
        onConfirm={handleDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}