import React, {
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

import {
  formatCurrency,
  generateInvoice,
} from '@/utils';

import {
  Search,
  Plus,
  Minus,
  X,
  CheckCircle,
  Printer,
  ShoppingCart,
} from 'lucide-react';

import toast from 'react-hot-toast';
import clsx from 'clsx';

import { useInventory } from '@/contexts/useInventory';

import type {
  Product,
  PaymentMethod,
  SaleItem,
} from '@/contexts/inventory-context';

/*
 * ============================================================
 * CART ITEM
 * ============================================================
 */

interface CartItem extends SaleItem {
  stock: number;
}

/*
 * ============================================================
 * CREATE SALE
 * ============================================================
 */

export default function CreateSale() {
  const navigate = useNavigate();

  /*
   * ==========================================================
   * INVENTORY CONTEXT
   * ==========================================================
   */

  const {
    products,
    categories,
    addSale,
  } = useInventory();

  /*
   * ==========================================================
   * PAGE STATE
   * ==========================================================
   */

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [search, setSearch] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('');

  /*
   * ==========================================================
   * PAYMENT STATE
   * ==========================================================
   */

  const [paymentModal, setPaymentModal] =
    useState(false);

  const [successModal, setSuccessModal] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('tunai');

  const [paymentAmount, setPaymentAmount] =
    useState<number | ''>('');

  const [invoice, setInvoice] =
    useState('');

  /*
   * ==========================================================
   * PAYMENT METHODS
   * ==========================================================
   */

  const paymentMethods = [
    {
      value: 'tunai',
      label: 'Tunai',
    },
    {
      value: 'transfer',
      label: 'Transfer Bank',
    },
    {
      value: 'debit',
      label: 'Kartu Debit',
    },
  ];

  /*
   * ==========================================================
   * CART TOTAL
   * ==========================================================
   */

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + item.subtotal,
        0
      ),
    [cart]
  );

  /*
   * ==========================================================
   * CHANGE
   * ==========================================================
   */

  const change =
    typeof paymentAmount ===
    'number'
      ? paymentAmount -
        cartTotal
      : 0;

  /*
   * ==========================================================
   * FILTER PRODUCTS
   * ==========================================================
   *
   * IMPORTANT:
   * products berasal dari InventoryContext,
   * bukan mockProducts.
   *
   * Jadi jika stok berubah:
   *
   * 3 -> 10
   *
   * halaman kasir akan membaca 10.
   */

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          if (
            keyword &&
            !product.name
              .toLowerCase()
              .includes(keyword) &&
            !product.code
              .toLowerCase()
              .includes(keyword)
          ) {
            return false;
          }

          if (
            categoryFilter &&
            product.categoryId !==
              Number(categoryFilter)
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      products,
      search,
      categoryFilter,
    ]);

  /*
   * ==========================================================
   * CATEGORY NAME
   * ==========================================================
   */

  const getCategoryName = (
    id: number
  ) =>
    categories.find(
      (category) =>
        category.id === id
    )?.name ?? '-';

  /*
   * ==========================================================
   * ADD TO CART
   * ==========================================================
   */

  const addToCart = (
    product: Product
  ) => {
    if (product.stock <= 0) {
      toast.error(
        'Stok produk habis.'
      );

      return;
    }

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.productId ===
          product.id
      );

    /*
     * Produk sudah ada di keranjang.
     */

    if (
      existingIndex >= 0
    ) {
      const newCart = [
        ...cart,
      ];

      const existingItem =
        newCart[
          existingIndex
        ];

      /*
       * Jangan melebihi stok
       * terbaru dari Context.
       */

      if (
        existingItem.quantity >=
        product.stock
      ) {
        toast.error(
          'Jumlah melebihi stok yang tersedia.'
        );

        return;
      }

      existingItem.quantity +=
        1;

      existingItem.stock =
        product.stock;

      existingItem.subtotal =
        existingItem.quantity *
        existingItem.unitPrice;

      setCart(newCart);

      return;
    }

    /*
     * Produk baru ke keranjang.
     */

    const newItem: CartItem = {
      productId:
        product.id,

      productCode:
        product.code,

      productName:
        product.name,

      quantity: 1,

      unitPrice:
        product.sellingPrice,

      stock:
        product.stock,

      subtotal:
        product.sellingPrice,
    };

    setCart([
      ...cart,
      newItem,
    ]);
  };

  /*
   * ==========================================================
   * UPDATE QUANTITY
   * ==========================================================
   */

  const updateQuantity = (
    index: number,
    delta: number
  ) => {
    const item =
      cart[index];

    if (!item) {
      return;
    }

    /*
     * Cari stok terbaru dari Context.
     */

    const currentProduct =
      products.find(
        (product) =>
          product.id ===
          item.productId
      );

    if (!currentProduct) {
      toast.error(
        'Produk tidak ditemukan.'
      );

      return;
    }

    const newQuantity =
      item.quantity +
      delta;

    /*
     * Jika quantity menjadi 0,
     * hapus dari cart.
     */

    if (newQuantity <= 0) {
      setCart(
        cart.filter(
          (_, cartIndex) =>
            cartIndex !== index
        )
      );

      return;
    }

    /*
     * Pastikan tidak melebihi stok.
     */

    if (
      newQuantity >
      currentProduct.stock
    ) {
      toast.error(
        `Stok tersedia hanya ${currentProduct.stock}.`
      );

      return;
    }

    const newCart = [
      ...cart,
    ];

    newCart[index] = {
      ...item,
      quantity:
        newQuantity,
      stock:
        currentProduct.stock,
      subtotal:
        newQuantity *
        item.unitPrice,
    };

    setCart(newCart);
  };

  /*
   * ==========================================================
   * REMOVE ITEM
   * ==========================================================
   */

  const removeItem = (
    index: number
  ) => {
    setCart(
      cart.filter(
        (_, cartIndex) =>
          cartIndex !== index
      )
    );
  };

  /*
   * ==========================================================
   * OPEN PAYMENT
   * ==========================================================
   */

  const openPayment = () => {
    if (
      cart.length === 0
    ) {
      toast.error(
        'Keranjang masih kosong.'
      );

      return;
    }

    /*
     * Cek ulang stok terbaru
     * sebelum membuka pembayaran.
     */

    for (const item of cart) {
      const product =
        products.find(
          (currentProduct) =>
            currentProduct.id ===
            item.productId
        );

      if (!product) {
        toast.error(
          `Produk ${item.productName} tidak ditemukan.`
        );

        return;
      }

      if (
        item.quantity >
        product.stock
      ) {
        toast.error(
          `Stok ${item.productName} tidak mencukupi.`
        );

        return;
      }
    }

    setPaymentAmount(
      ''
    );

    setPaymentModal(
      true
    );
  };

  /*
   * ==========================================================
   * PAYMENT
   * ==========================================================
   */

  const handlePay = () => {
    if (
      cart.length === 0
    ) {
      toast.error(
        'Keranjang masih kosong.'
      );

      return;
    }

    if (
      typeof paymentAmount !==
      'number'
    ) {
      toast.error(
        'Nominal pembayaran wajib diisi.'
      );

      return;
    }

    if (
      paymentAmount <
      cartTotal
    ) {
      toast.error(
        'Nominal pembayaran kurang dari total.'
      );

      return;
    }

    /*
     * Ambil user login dari localStorage.
     *
     * Jika belum tersedia, gunakan Administrator.
     */

    let cashierName =
      'Administrator';

    const storedUser =
      localStorage.getItem(
        'procom_user'
      );

    if (storedUser) {
      try {
        const user =
          JSON.parse(
            storedUser
          ) as {
            name?: string;
            username?: string;
          };

        cashierName =
          user.name ??
          user.username ??
          cashierName;
      } catch {
        /*
         * Abaikan jika data user
         * tidak dapat diparse.
         */
      }
    }

    /*
     * Invoice baru.
     */

    const newInvoice =
      generateInvoice();

    /*
     * Sale items.
     */

    const saleItems:
      SaleItem[] =
      cart.map(
        (item) => ({
          productId:
            item.productId,
          productCode:
            item.productCode,
          productName:
            item.productName,
          quantity:
            item.quantity,
          unitPrice:
            item.unitPrice,
          subtotal:
            item.subtotal,
        })
      );

    /*
     * Simpan transaksi.
     *
     * addSale() akan:
     *
     * - validasi stok
     * - mengurangi stok
     * - membuat stock transaction
     * - menyimpan sale
     */

    const success =
      addSale({
        invoice:
          newInvoice,

        date:
          new Date().toISOString(),

        cashierName,

        items:
          saleItems,

        subtotal:
          cartTotal,

        discount: 0,

        tax: 0,

        total:
          cartTotal,

        paymentMethod,

        paymentAmount,

        change,
      });

    if (!success) {
      toast.error(
        'Transaksi gagal diproses. Stok mungkin sudah berubah.'
      );

      return;
    }

    /*
     * Berhasil.
     */

    setInvoice(
      newInvoice
    );

    setPaymentModal(
      false
    );

    setSuccessModal(
      true
    );

    toast.success(
      'Pembayaran berhasil dan stok telah diperbarui.'
    );
  };

  /*
   * ==========================================================
   * RESET TRANSACTION
   * ==========================================================
   */

  const resetTransaction = () => {
    setCart([]);

    setPaymentAmount(
      ''
    );

    setPaymentMethod(
      'tunai'
    );

    setInvoice('');

    setSuccessModal(
      false
    );

    setSearch('');

    setCategoryFilter(
      ''
    );
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      {/* =====================================================
          LEFT - PRODUCTS
          ===================================================== */}

      <div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="flex gap-4">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />

              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="Cari produk / barcode..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* CATEGORY */}

            <select
              className="border rounded-md px-3 py-2 bg-white"
              value={
                categoryFilter
              }
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                Semua Kategori
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* PRODUCT LIST */}

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(
              (product) => (
                <div
                  key={
                    product.id
                  }
                  onClick={() =>
                    product.stock >
                      0 &&
                    addToCart(
                      product
                    )
                  }
                  className={clsx(
                    'p-3 bg-white border rounded-lg cursor-pointer transition-colors relative flex flex-col h-full',
                    product.stock >
                      0
                      ? 'hover:border-indigo-500 hover:shadow-md border-gray-200'
                      : 'opacity-50 cursor-not-allowed border-gray-200'
                  )}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {getCategoryName(
                      product.categoryId
                    )}
                  </div>

                  <div className="font-semibold text-gray-900 leading-tight mb-2 flex-1">
                    {product.name}
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div className="text-indigo-600 font-bold text-sm">
                      {formatCurrency(
                        product.sellingPrice
                      )}
                    </div>

                    <div
                      className={clsx(
                        'text-xs px-2 py-1 rounded-full',
                        product.stock >
                          0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      Sisa:{' '}
                      {
                        product.stock
                      }
                    </div>
                  </div>
                </div>
              )
            )}

            {filteredProducts.length ===
              0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Produk tidak
                ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT - CART
          ===================================================== */}

      <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-lg shadow border border-gray-200 h-full">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Pesanan Saat Ini
          </h2>

          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
            {cart.reduce(
              (total, item) =>
                total +
                item.quantity,
              0
            )}{' '}
            item
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length ===
          0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />

              <p>
                Keranjang masih
                kosong
              </p>
            </div>
          ) : (
            cart.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.productId
                  }
                  className="flex gap-2 items-start border-b pb-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm leading-tight mb-1">
                      {
                        item.productName
                      }
                    </div>

                    <div className="text-indigo-600 font-semibold text-sm">
                      {formatCurrency(
                        item.unitPrice
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-md">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            index,
                            -1
                          )
                        }
                        className="p-1 hover:text-indigo-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-6 text-center text-sm font-medium">
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            index,
                            1
                          )
                        }
                        className="p-1 hover:text-indigo-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Hapus
                    </button>

                    <div className="text-xs font-semibold text-gray-700">
                      {formatCurrency(
                        item.subtotal
                      )}
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* TOTAL */}

        <div className="p-4 border-t bg-slate-50 rounded-b-lg space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-gray-500 font-medium">
              Total
            </span>

            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                cartTotal
              )}
            </span>
          </div>

          <Button
            variant="primary"
            className="w-full py-3 text-lg"
            onClick={
              openPayment
            }
            disabled={
              cart.length ===
              0
            }
          >
            Proses Pembayaran
          </Button>
        </div>
      </div>

      {/* =====================================================
          PAYMENT MODAL
          ===================================================== */}

      <Modal
        isOpen={
          paymentModal
        }
        onClose={() =>
          setPaymentModal(
            false
          )
        }
        title="Pembayaran"
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-indigo-900 font-medium">
              Total Tagihan
            </span>

            <span className="text-2xl font-bold text-indigo-700">
              {formatCurrency(
                cartTotal
              )}
            </span>
          </div>

          <div className="space-y-4">
            <Select
              label="Metode Pembayaran"
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target
                    .value as PaymentMethod
                )
              }
              options={
                paymentMethods
              }
            />

            <Input
              label="Nominal Dibayar (Rp)"
              type="number"
              min={cartTotal}
              value={
                paymentAmount
              }
              onChange={(e) =>
                setPaymentAmount(
                  Number(
                    e.target
                      .value
                  ) || ''
                )
              }
            />

            {typeof paymentAmount ===
              'number' &&
              paymentAmount >=
                cartTotal && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold p-2 border border-emerald-200 bg-emerald-50 rounded-lg">
                  <span>
                    Kembalian
                  </span>

                  <span>
                    {formatCurrency(
                      change
                    )}
                  </span>
                </div>
              )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                setPaymentModal(
                  false
                )
              }
            >
              Batal
            </Button>

            <Button
              variant="primary"
              className="flex-1"
              onClick={
                handlePay
              }
              disabled={
                typeof paymentAmount !==
                  'number' ||
                paymentAmount <
                  cartTotal
              }
            >
              Bayar
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          SUCCESS MODAL
          ===================================================== */}

      <Modal
        isOpen={
          successModal
        }
        onClose={
          resetTransaction
        }
        title=""
      >
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pembayaran
              Berhasil!
            </h2>

            <p className="text-gray-500">
              No. Invoice:{' '}
              {invoice}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">
                Total Tagihan
              </span>

              <span className="font-semibold">
                {formatCurrency(
                  cartTotal
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Pembayaran
              </span>

              <span className="font-semibold">
                {formatCurrency(
                  Number(
                    paymentAmount
                  )
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-500">
                Kembalian
              </span>

              <span className="font-bold text-emerald-600">
                {formatCurrency(
                  change
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              leftIcon={Printer}
              onClick={() =>
                navigate(
                  `/sales/receipt/${invoice}`
                )
              }
            >
              Cetak Struk
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={
                  resetTransaction
                }
              >
                Transaksi Baru
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  navigate(
                    `/sales/${invoice}`
                  )
                }
              >
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}