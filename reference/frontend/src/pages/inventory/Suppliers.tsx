import React, {
  useMemo,
  useState,
} from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import {
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

import { toast } from 'react-hot-toast';

import { useInventory } from '@/contexts/useInventory';

import type { Supplier } from '@/contexts/inventory-context';

export default function Suppliers() {
  /*
   * ==========================================================
   * INVENTORY CONTEXT
   * ==========================================================
   *
   * Supplier sekarang menggunakan state global.
   * Tidak lagi menggunakan mockSuppliers sebagai state lokal.
   */

  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  } = useInventory();

  /*
   * ==========================================================
   * PAGE STATE
   * ==========================================================
   */

  const [search, setSearch] =
    useState('');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<'add' | 'edit'>('add');

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  /*
   * ==========================================================
   * FORM STATE
   * ==========================================================
   */

  const [formData, setFormData] =
    useState<{
      name: string;
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
      status: 'aktif' | 'nonaktif';
    }>({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'aktif',
    });

  /*
   * ==========================================================
   * OPTIONS
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * FILTER SUPPLIER
   * ==========================================================
   */

  const filteredSuppliers =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) => {
          const values = [
            supplier.name,
            supplier.contactPerson ?? '',
            supplier.phone,
            supplier.email ?? '',
            supplier.address,
            supplier.code,
          ];

          return values.some(
            (value) =>
              value
                .toLowerCase()
                .includes(keyword)
          );
        }
      );
    }, [suppliers, search]);

  /*
   * ==========================================================
   * RESET FORM
   * ==========================================================
   */

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'aktif',
    });

    setEditingId(null);
  };

  /*
   * ==========================================================
   * OPEN ADD MODAL
   * ==========================================================
   */

  const openAddModal = () => {
    setModalMode('add');

    resetForm();

    setIsModalOpen(true);
  };

  /*
   * ==========================================================
   * OPEN EDIT MODAL
   * ==========================================================
   */

  const openEditModal = (
    supplier: Supplier
  ) => {
    setModalMode('edit');

    setFormData({
      name: supplier.name,
      contactPerson:
        supplier.contactPerson ?? '',
      phone: supplier.phone,
      email:
        supplier.email ?? '',
      address: supplier.address,
      status: supplier.status,
    });

    setEditingId(supplier.id);

    setIsModalOpen(true);
  };

  /*
   * ==========================================================
   * SUBMIT FORM
   * ==========================================================
   */

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    /*
     * --------------------------------------------------------
     * Bersihkan input
     * --------------------------------------------------------
     */

    const name =
      formData.name.trim();

    const contactPerson =
      formData.contactPerson.trim();

    const phone =
      formData.phone.trim();

    const email =
      formData.email.trim();

    const address =
      formData.address.trim();

    /*
     * --------------------------------------------------------
     * Validasi field wajib
     * --------------------------------------------------------
     */

    if (!name) {
      toast.error(
        'Nama supplier wajib diisi.'
      );

      return;
    }

    if (!contactPerson) {
      toast.error(
        'Kontak person wajib diisi.'
      );

      return;
    }

    if (!phone) {
      toast.error(
        'Nomor telepon wajib diisi.'
      );

      return;
    }

    if (!address) {
      toast.error(
        'Alamat supplier wajib diisi.'
      );

      return;
    }

    /*
     * --------------------------------------------------------
     * Validasi nama supplier duplikat
     * --------------------------------------------------------
     */

    const duplicateName =
      suppliers.some(
        (supplier) =>
          supplier.id !== editingId &&
          supplier.name
            .trim()
            .toLowerCase() ===
            name.toLowerCase()
      );

    if (duplicateName) {
      toast.error(
        'Nama supplier sudah digunakan.'
      );

      return;
    }

    /*
     * --------------------------------------------------------
     * Validasi email duplikat
     * --------------------------------------------------------
     *
     * Email boleh kosong.
     * Jika diisi, email tidak boleh sama dengan supplier lain.
     */

    const duplicateEmail =
      email !== '' &&
      suppliers.some(
        (supplier) =>
          supplier.id !== editingId &&
          Boolean(
            supplier.email
          ) &&
          supplier.email!
            .trim()
            .toLowerCase() ===
            email.toLowerCase()
      );

    if (duplicateEmail) {
      toast.error(
        'Email supplier sudah digunakan.'
      );

      return;
    }

    /*
     * ========================================================
     * TAMBAH SUPPLIER
     * ========================================================
     */

    if (modalMode === 'add') {
      /*
       * Cari nomor kode terbesar yang sudah ada.
       *
       * Contoh:
       * SUP-001
       * SUP-002
       * SUP-003
       *
       * supplier baru -> SUP-004
       */

      const highestCode =
        suppliers.reduce(
          (highest, supplier) => {
            const match =
              supplier.code.match(
                /(\d+)$/
              );

            if (!match) {
              return highest;
            }

            const number =
              Number(match[1]);

            return Math.max(
              highest,
              number
            );
          },
          0
        );

      const nextCode =
        `SUP-${String(
          highestCode + 1
        ).padStart(3, '0')}`;

      /*
       * Supplier baru.
       */

      const newSupplier: Supplier =
        {
          id: Date.now(),
          code: nextCode,
          name,
          contactPerson,
          phone,
          email,
          address,
          status:
            formData.status,
          createdAt:
            new Date().toISOString(),
        };

      /*
       * Simpan melalui Context.
       */

      addSupplier(
        newSupplier
      );

      toast.success(
        'Supplier berhasil ditambahkan.'
      );
    }

    /*
     * ========================================================
     * EDIT SUPPLIER
     * ========================================================
     */

    else {
      if (editingId === null) {
        toast.error(
          'Supplier yang akan diperbarui tidak ditemukan.'
        );

        return;
      }

      /*
       * Cari supplier asli.
       */

      const currentSupplier =
        suppliers.find(
          (supplier) =>
            supplier.id ===
            editingId
        );

      if (!currentSupplier) {
        toast.error(
          'Supplier tidak ditemukan.'
        );

        return;
      }

      /*
       * Pertahankan data yang tidak diedit:
       *
       * - id
       * - code
       * - createdAt
       */

      const updatedSupplier:
        Supplier = {
        ...currentSupplier,
        name,
        contactPerson,
        phone,
        email,
        address,
        status:
          formData.status,
      };

      /*
       * Simpan melalui Context.
       */

      updateSupplier(
        updatedSupplier
      );

      toast.success(
        'Supplier berhasil diperbarui.'
      );
    }

    /*
     * Tutup modal setelah berhasil.
     */

    setIsModalOpen(false);

    resetForm();
  };

  /*
   * ==========================================================
   * OPEN DELETE CONFIRM
   * ==========================================================
   */

  const openDeleteConfirm = (
    id: number
  ) => {
    setDeleteId(id);

    setIsDeleteOpen(true);
  };

  /*
   * ==========================================================
   * DELETE SUPPLIER
   * ==========================================================
   */

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    /*
     * Context akan mengecek apakah supplier
     * masih digunakan oleh produk.
     */

    const success =
      deleteSupplier(
        deleteId
      );

    /*
     * Supplier masih digunakan.
     */

    if (!success) {
      toast.error(
        'Supplier tidak dapat dihapus karena masih digunakan oleh produk.'
      );

      setIsDeleteOpen(false);

      setDeleteId(null);

      return;
    }

    /*
     * Berhasil dihapus.
     */

    toast.success(
      'Supplier berhasil dihapus.'
    );

    setIsDeleteOpen(false);

    setDeleteId(null);
  };

  /*
   * ==========================================================
   * CLOSE MODAL
   * ==========================================================
   */

  const handleCloseModal = () => {
    setIsModalOpen(false);

    resetForm();
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Supplier"
        action={
          <Button
            onClick={openAddModal}
            leftIcon={Plus}
          >
            Tambah Supplier
          </Button>
        }
      />

      <Card>
        {/* ==================================================
            SEARCH
            ================================================== */}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Cari supplier atau kontak..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* ==================================================
            TABLE
            ================================================== */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  Kode
                </th>

                <th className="px-4 py-3">
                  Nama Supplier
                </th>

                <th className="px-4 py-3">
                  Kontak Person
                </th>

                <th className="px-4 py-3">
                  Telepon
                </th>

                <th className="px-4 py-3">
                  Alamat
                </th>

                <th className="px-4 py-3 text-center">
                  Status
                </th>

                <th className="px-4 py-3 text-right">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.map(
                (supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {supplier.code}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {supplier.name}
                    </td>

                    <td className="px-4 py-3">
                      {supplier.contactPerson ||
                        '-'}
                    </td>

                    <td className="px-4 py-3">
                      {supplier.phone}
                    </td>

                    <td className="px-4 py-3 truncate max-w-xs">
                      {supplier.address}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <StatusBadge
                        status={
                          supplier.status
                        }
                      />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              supplier
                            )
                          }
                          className="p-1 text-amber-600 hover:text-amber-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteConfirm(
                              supplier.id
                            )
                          }
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {filteredSuppliers.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />

                    Tidak ada supplier
                    ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ====================================================
          ADD / EDIT MODAL
          ==================================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalMode === 'add'
            ? 'Tambah Supplier'
            : 'Edit Supplier'
        }
        size="md"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Supplier"
              value={formData.name}
              onChange={(e) =>
                setFormData(
                  (current) => ({
                    ...current,
                    name:
                      e.target.value,
                  })
                )
              }
              required
            />

            <Input
              label="Kontak Person"
              value={
                formData.contactPerson
              }
              onChange={(e) =>
                setFormData(
                  (current) => ({
                    ...current,
                    contactPerson:
                      e.target.value,
                  })
                )
              }
              required
            />

            <Input
              label="Telepon"
              value={formData.phone}
              onChange={(e) =>
                setFormData(
                  (current) => ({
                    ...current,
                    phone:
                      e.target.value,
                  })
                )
              }
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData(
                  (current) => ({
                    ...current,
                    email:
                      e.target.value,
                  })
                )
              }
            />
          </div>

          {/* ==================================================
              ALAMAT
              ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData(
                  (current) => ({
                    ...current,
                    address:
                      e.target.value,
                  })
                )
              }
              required
            />
          </div>

          {/* ==================================================
              STATUS
              ================================================== */}

          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) =>
              setFormData(
                (current) => ({
                  ...current,
                  status:
                    e.target.value as
                      | 'aktif'
                      | 'nonaktif',
                })
              )
            }
          />

          {/* ==================================================
              ACTION
              ================================================== */}

          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={
                handleCloseModal
              }
            >
              Batal
            </Button>

            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ====================================================
          DELETE CONFIRMATION
          ==================================================== */}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={
          handleDelete
        }
        title="Hapus Supplier"
        message="Apakah Anda yakin ingin menghapus supplier ini?"
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}