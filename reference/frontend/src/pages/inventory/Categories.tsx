import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useInventory } from '@/contexts/useInventory';

export default function Categories() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword)
    );
  }, [categories, search]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (category: (typeof categories)[number]) => {
    setModalMode('edit');

    setFormData({
      name: category.name,
      description: category.description || '',
    });

    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error('Nama kategori wajib diisi.');
      return;
    }

    const duplicateName = categories.some(
      (category) =>
        category.id !== editingId &&
        category.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateName) {
      toast.error('Nama kategori sudah digunakan.');
      return;
    }

    if (modalMode === 'add') {
      const newCategory = {
        id: Date.now(),
        name,
        description,
        productCount: 0,
        createdAt: new Date().toISOString(),
      };

      addCategory(newCategory);

      toast.success('Kategori berhasil ditambahkan');
    } else if (editingId !== null) {
      const currentCategory = categories.find(
        (category) => category.id === editingId
      );

      if (!currentCategory) {
        toast.error('Kategori tidak ditemukan');
        return;
      }

      updateCategory({
        ...currentCategory,
        name,
        description,
      });

      toast.success('Kategori berhasil diperbarui');
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    const success = deleteCategory(deleteId);

    if (!success) {
      toast.error(
        'Kategori tidak dapat dihapus karena masih digunakan oleh produk.'
      );
      return;
    }

    toast.success('Kategori berhasil dihapus');

    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Produk"
        action={
          <Button onClick={openAddModal} leftIcon={Plus}>
            Tambah Kategori
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  Nama Kategori
                </th>

                <th className="px-4 py-3">
                  Deskripsi
                </th>

                <th className="px-4 py-3 text-right">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {category.name}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {category.description || '-'}
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      className="p-1 text-amber-600 hover:text-amber-800"
                      title="Edit kategori"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteConfirm(category.id)
                      }
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === 'add'
            ? 'Tambah Kategori'
            : 'Edit Kategori'
        }
        size="sm"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            label="Nama Kategori"
            value={formData.name}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                name: e.target.value,
              }))
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={closeModal}
            >
              Batal
            </Button>

            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini?"
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}