import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import { mockProducts } from '@/mock/products';
import { mockCategories } from '@/mock/categories';
import { mockSuppliers } from '@/mock/suppliers';
import { mockStockTransactions } from '@/mock/stockTransactions';
import { mockSales } from '@/mock/sales';

import {
  InventoryContext,
  type Product,
  type Category,
  type Supplier,
  type StockTransaction,
  type AddStockInData,
  type AddStockOutData,
  type Sale,
  type AddSaleData,
} from './inventory-context';

/*
 * ============================================================
 * INITIAL STOCK TRANSACTIONS
 * ============================================================
 */

const initialStockTransactions: StockTransaction[] =
  mockStockTransactions.map(
    (transaction) => ({
      id: transaction.id,
      date: transaction.date,
      productId:
        transaction.productId,
      productName:
        transaction.productName,
      type: transaction.type,
      quantity:
        transaction.quantity,
      reference:
        transaction.reference,
      userName:
        transaction.userName,
      stockBefore:
        transaction.stockBefore,
      stockAfter:
        transaction.stockAfter,
    })
  );

/*
 * ============================================================
 * INITIAL SALES
 * ============================================================
 *
 * Mapping dibuat eksplisit agar data mock lama tetap kompatibel
 * dengan struktur Sale yang sekarang digunakan Context.
 */

const initialSales: Sale[] =
  mockSales.map((sale) => ({
    id: sale.id,
    invoice: sale.invoice,
    date: sale.date,
    cashierName:
      sale.cashierName,
    items: sale.items.map(
      (item) => ({
        productId:
          item.productId,
        productCode:
          item.productCode ?? '',
        productName:
          item.productName,
        quantity:
          item.quantity,
        unitPrice:
          item.unitPrice ??
          item.price ??
          0,
        subtotal:
          item.subtotal,
      })
    ),
    subtotal:
      sale.subtotal,
    discount:
      sale.discount,
    tax:
      sale.tax ?? 0,
    total:
      sale.total,
    paymentMethod:
      sale.paymentMethod,
    paymentAmount:
      sale.paymentAmount,
    change:
      sale.change,
    status:
      sale.status.toLowerCase() as
        | 'selesai'
        | 'pending'
        | 'dibatalkan',
  }));

/*
 * ============================================================
 * PROVIDER
 * ============================================================
 */

export function InventoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * ==========================================================
   * MASTER DATA
   * ==========================================================
   */

  const [products, setProducts] =
    useState<Product[]>(
      mockProducts
    );

  const [categories, setCategories] =
    useState<Category[]>(
      mockCategories
    );

  const [suppliers, setSuppliers] =
    useState<Supplier[]>(
      mockSuppliers
    );

  const [
    stockTransactions,
    setStockTransactions,
  ] = useState<StockTransaction[]>(
    initialStockTransactions
  );

  const [sales, setSales] =
    useState<Sale[]>(
      initialSales
    );

  /*
   * ==========================================================
   * CATEGORY PRODUCT COUNT
   * ==========================================================
   */

  const categoriesWithCounts =
    useMemo(
      () =>
        categories.map(
          (category) => ({
            ...category,
            productCount:
              products.filter(
                (product) =>
                  product.categoryId ===
                  category.id
              ).length,
          })
        ),
      [
        categories,
        products,
      ]
    );

  /*
   * ==========================================================
   * PRODUCT
   * ==========================================================
   */

  const addProduct =
    useCallback(
      (product: Product) => {
        setProducts(
          (currentProducts) => [
            ...currentProducts,
            product,
          ]
        );
      },
      []
    );

  const updateProduct =
    useCallback(
      (
        updatedProduct: Product
      ) => {
        setProducts(
          (currentProducts) =>
            currentProducts.map(
              (product) =>
                product.id ===
                updatedProduct.id
                  ? updatedProduct
                  : product
            )
        );
      },
      []
    );

  const deleteProduct =
    useCallback(
      (id: number) => {
        setProducts(
          (currentProducts) =>
            currentProducts.filter(
              (product) =>
                product.id !== id
            )
        );
      },
      []
    );

  /*
   * ==========================================================
   * CATEGORY
   * ==========================================================
   */

  const addCategory =
    useCallback(
      (category: Category) => {
        setCategories(
          (currentCategories) => [
            ...currentCategories,
            category,
          ]
        );
      },
      []
    );

  const updateCategory =
    useCallback(
      (
        updatedCategory: Category
      ) => {
        setCategories(
          (currentCategories) =>
            currentCategories.map(
              (category) =>
                category.id ===
                updatedCategory.id
                  ? updatedCategory
                  : category
            )
        );
      },
      []
    );

  const deleteCategory =
    useCallback(
      (id: number): boolean => {
        const isUsedByProduct =
          products.some(
            (product) =>
              product.categoryId ===
              id
          );

        if (isUsedByProduct) {
          return false;
        }

        setCategories(
          (currentCategories) =>
            currentCategories.filter(
              (category) =>
                category.id !== id
            )
        );

        return true;
      },
      [products]
    );

  /*
   * ==========================================================
   * SUPPLIER
   * ==========================================================
   */

  const addSupplier =
    useCallback(
      (supplier: Supplier) => {
        setSuppliers(
          (currentSuppliers) => [
            ...currentSuppliers,
            supplier,
          ]
        );
      },
      []
    );

  const updateSupplier =
    useCallback(
      (
        updatedSupplier: Supplier
      ) => {
        setSuppliers(
          (currentSuppliers) =>
            currentSuppliers.map(
              (supplier) =>
                supplier.id ===
                updatedSupplier.id
                  ? updatedSupplier
                  : supplier
            )
        );
      },
      []
    );

  const deleteSupplier =
    useCallback(
      (id: number): boolean => {
        const isUsedByProduct =
          products.some(
            (product) =>
              product.supplierId ===
              id
          );

        if (isUsedByProduct) {
          return false;
        }

        setSuppliers(
          (currentSuppliers) =>
            currentSuppliers.filter(
              (supplier) =>
                supplier.id !== id
            )
        );

        return true;
      },
      [products]
    );

  /*
   * ==========================================================
   * STOCK IN
   * ==========================================================
   */

  const addStockIn =
    useCallback(
      (
        data: AddStockInData
      ): boolean => {
        if (
          data.items.length === 0
        ) {
          return false;
        }

        if (!data.date) {
          return false;
        }

        if (!data.supplierId) {
          return false;
        }

        const supplierExists =
          suppliers.some(
            (supplier) =>
              supplier.id ===
              data.supplierId
          );

        if (!supplierExists) {
          return false;
        }

        const updatedProducts =
          [...products];

        const newTransactions:
          StockTransaction[] =
          [];

        let transactionId =
          Date.now();

        for (const item of data.items) {
          const productIndex =
            updatedProducts.findIndex(
              (product) =>
                product.id ===
                item.productId
            );

          if (
            productIndex === -1
          ) {
            return false;
          }

          if (
            item.quantity <= 0 ||
            item.price < 0
          ) {
            return false;
          }

          const product =
            updatedProducts[
              productIndex
            ];

          const stockBefore =
            product.stock;

          const stockAfter =
            stockBefore +
            item.quantity;

          updatedProducts[
            productIndex
          ] = {
            ...product,
            stock:
              stockAfter,
            purchasePrice:
              item.price,
          };

          newTransactions.push({
            id:
              transactionId++,
            date:
              data.date,
            productId:
              product.id,
            productName:
              product.name,
            type:
              'masuk',
            quantity:
              item.quantity,
            reference:
              data.reference ||
              'STOCK-IN',
            userName:
              data.userName,
            stockBefore,
            stockAfter,
            supplierId:
              data.supplierId,
            supplierName:
              data.supplierName,
            unitPrice:
              item.price,
          });
        }

        setProducts(
          updatedProducts
        );

        setStockTransactions(
          (
            currentTransactions
          ) => [
            ...currentTransactions,
            ...newTransactions,
          ]
        );

        return true;
      },
      [
        products,
        suppliers,
      ]
    );

  /*
   * ==========================================================
   * STOCK OUT
   * ==========================================================
   */

  const addStockOut =
    useCallback(
      (
        data: AddStockOutData
      ): boolean => {
        if (
          data.quantity <= 0
        ) {
          return false;
        }

        if (!data.date) {
          return false;
        }

        const product =
          products.find(
            (item) =>
              item.id ===
              data.productId
          );

        if (!product) {
          return false;
        }

        if (
          data.quantity >
          product.stock
        ) {
          return false;
        }

        const stockBefore =
          product.stock;

        const stockAfter =
          stockBefore -
          data.quantity;

        const updatedProducts =
          products.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    stock:
                      stockAfter,
                  }
                : item
          );

        const transaction:
          StockTransaction = {
          id: Date.now(),
          date:
            data.date,
          productId:
            product.id,
          productName:
            product.name,
          type:
            'keluar',
          quantity:
            -data.quantity,
          reference:
            data.reference ||
            'STOCK-OUT',
          userName:
            data.userName,
          stockBefore,
          stockAfter,
          reason:
            data.reason,
          notes:
            data.notes,
        };

        setProducts(
          updatedProducts
        );

        setStockTransactions(
          (
            currentTransactions
          ) => [
            ...currentTransactions,
            transaction,
          ]
        );

        return true;
      },
      [products]
    );

  /*
   * ==========================================================
   * SALES
   * ==========================================================
   *
   * Ini adalah bagian penting.
   *
   * Saat pembayaran berhasil:
   *
   * 1. Validasi semua produk
   * 2. Validasi stok
   * 3. Kurangi stok
   * 4. Buat transaksi penjualan
   * 5. Simpan sale
   *
   * Semua dilakukan dalam satu fungsi.
   */

const addSale =
  useCallback(
    (
      data: AddSaleData
    ): number | null => {
      /*
       * ----------------------------------------------------
       * Validasi dasar
       * ----------------------------------------------------
       */

      if (
        data.items.length === 0
      ) {
        return null;
      }

      if (!data.invoice) {
        return null;
      }

      if (!data.date) {
        return null;
      }

      if (
        data.total <= 0
      ) {
        return null;
      }

      if (
        data.paymentAmount <
        data.total
      ) {
        return null;
      }

      /*
       * ----------------------------------------------------
       * Salin products
       * ----------------------------------------------------
       */

      const updatedProducts =
        [...products];

      const newTransactions:
        StockTransaction[] =
        [];

      /*
       * ----------------------------------------------------
       * Validasi seluruh item terlebih dahulu.
       *
       * Jangan mengubah state sebelum semua item valid.
       * ----------------------------------------------------
       */

      for (const item of data.items) {
        const productIndex =
          updatedProducts.findIndex(
            (product) =>
              product.id ===
              item.productId
          );

        if (
          productIndex === -1
        ) {
          return null;
        }

        if (
          item.quantity <= 0
        ) {
          return null;
        }

        const product =
          updatedProducts[
            productIndex
          ];

        if (
          item.quantity >
          product.stock
        ) {
          return null;
        }
      }

      /*
       * ----------------------------------------------------
       * Setelah seluruh item valid,
       * baru kurangi stok.
       * ----------------------------------------------------
       */

      for (const item of data.items) {
        const productIndex =
          updatedProducts.findIndex(
            (product) =>
              product.id ===
              item.productId
          );

        const product =
          updatedProducts[
            productIndex
          ];

        const stockBefore =
          product.stock;

        const stockAfter =
          stockBefore -
          item.quantity;

        /*
         * Update stok.
         */

        updatedProducts[
          productIndex
        ] = {
          ...product,
          stock:
            stockAfter,
        };

        /*
         * Buat riwayat stok
         * penjualan.
         */

        newTransactions.push({
          id:
            Date.now() +
            newTransactions.length,
          date:
            data.date,
          productId:
            product.id,
          productName:
            product.name,
          type:
            'penjualan',
          quantity:
            -item.quantity,
          reference:
            data.invoice,
          userName:
            data.cashierName,
          stockBefore,
          stockAfter,
          unitPrice:
            item.unitPrice,
        });
      }

      /*
       * ----------------------------------------------------
       * Buat transaksi Sale.
       * ----------------------------------------------------
       */

      const newSale:
        Sale = {
        id:
          Date.now(),
        invoice:
          data.invoice,
        date:
          data.date,
        cashierName:
          data.cashierName,
        items:
          data.items.map(
            (item) => ({
              ...item,
            })
          ),
        subtotal:
          data.subtotal,
        discount:
          data.discount,
        tax:
          data.tax,
        total:
          data.total,
        paymentMethod:
          data.paymentMethod,
        paymentAmount:
          data.paymentAmount,
        change:
          data.change,
        status:
          'selesai',
      };

      /*
       * ----------------------------------------------------
       * Update products.
       * ----------------------------------------------------
       */

      setProducts(
        updatedProducts
      );

      /*
       * ----------------------------------------------------
       * Tambahkan riwayat stok.
       * ----------------------------------------------------
       */

      setStockTransactions(
        (
          currentTransactions
        ) => [
          ...currentTransactions,
          ...newTransactions,
        ]
      );

      /*
       * ----------------------------------------------------
       * Tambahkan transaksi penjualan.
       * ----------------------------------------------------
       */

      setSales(
        (currentSales) => [
          ...currentSales,
          newSale,
        ]
      );

      /*
       * ----------------------------------------------------
       * Berhasil.
       *
       * Return ID sale agar
       * dapat digunakan oleh
       * halaman detail/receipt.
       * ----------------------------------------------------
       */

      return newSale.id;
    },
    [products]
  );
  /*
   * ==========================================================
   * PROVIDER
   * ==========================================================
   */

  return (
    <InventoryContext.Provider
      value={{
        /*
         * PRODUCTS
         */
        products,
        addProduct,
        updateProduct,
        deleteProduct,

        /*
         * CATEGORIES
         */
        categories:
          categoriesWithCounts,
        addCategory,
        updateCategory,
        deleteCategory,

        /*
         * SUPPLIERS
         */
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,

        /*
         * STOCK
         */
        stockTransactions,
        addStockIn,
        addStockOut,

        /*
         * SALES
         */
        sales,
        addSale,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}