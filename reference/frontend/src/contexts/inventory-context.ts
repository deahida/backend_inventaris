import { createContext } from 'react';

import { mockProducts } from '@/mock/products';
import { mockCategories } from '@/mock/categories';
import { mockSuppliers } from '@/mock/suppliers';
import { mockStockTransactions } from '@/mock/stockTransactions';
import { mockSales } from '@/mock/sales';

export type Product =
  (typeof mockProducts)[number];

export type Category =
  (typeof mockCategories)[number];

export type Supplier =
  (typeof mockSuppliers)[number];

/*
 * ============================================================
 * STOCK TRANSACTION
 * ============================================================
 */

export type StockTransactionType =
  | 'masuk'
  | 'keluar'
  | 'penjualan'
  | 'penyesuaian';

export interface StockTransaction {
  id: number;
  date: string;
  productId: number;
  productName: string;
  type: StockTransactionType;
  quantity: number;
  reference: string;
  userName: string;
  stockBefore: number;
  stockAfter: number;
  supplierId?: number;
  supplierName?: string;
  unitPrice?: number;
  reason?: string;
  notes?: string;
}

/*
 * ============================================================
 * STOCK IN
 * ============================================================
 */

export interface StockInItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface AddStockInData {
  date: string;
  supplierId: number;
  supplierName: string;
  reference: string;
  items: StockInItem[];
  userName: string;
}

/*
 * ============================================================
 * STOCK OUT
 * ============================================================
 */

export interface AddStockOutData {
  date: string;
  productId: number;
  quantity: number;
  reason: string;
  notes: string;
  reference: string;
  userName: string;
}

/*
 * ============================================================
 * SALE
 * ============================================================
 */

export type SaleStatus =
  | 'selesai'
  | 'pending'
  | 'dibatalkan';

export type PaymentMethod =
  | 'tunai'
  | 'transfer'
  | 'debit'
  | 'kartu_kredit';

export interface SaleItem {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice: string;
  date: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  change: number;
  status: SaleStatus;
}

export type InitialSale =
  (typeof mockSales)[number];

export interface AddSaleData {
  invoice: string;
  date: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  change: number;
}

/*
 * ============================================================
 * INVENTORY CONTEXT
 * ============================================================
 */

export interface InventoryContextType {
  /*
   * PRODUCT
   */

  products: Product[];

  addProduct: (
    product: Product
  ) => void;

  updateProduct: (
    product: Product
  ) => void;

  deleteProduct: (
    id: number
  ) => void;

  /*
   * CATEGORY
   */

  categories: Category[];

  addCategory: (
    category: Category
  ) => void;

  updateCategory: (
    category: Category
  ) => void;

  deleteCategory: (
    id: number
  ) => boolean;

  /*
   * SUPPLIER
   */

  suppliers: Supplier[];

  addSupplier: (
    supplier: Supplier
  ) => void;

  updateSupplier: (
    supplier: Supplier
  ) => void;

  deleteSupplier: (
    id: number
  ) => boolean;

  /*
   * STOCK
   */

  stockTransactions: StockTransaction[];

  addStockIn: (
    data: AddStockInData
  ) => boolean;

  addStockOut: (
    data: AddStockOutData
  ) => boolean;

  /*
   * SALES
   */

  sales: Sale[];

  addSale: (
  data: AddSaleData
  ) => number | null;
}

/*
 * ============================================================
 * CONTEXT
 * ============================================================
 */

export const InventoryContext =
  createContext<
    InventoryContextType | undefined
  >(undefined);

export type InitialStockTransactions =
  (typeof mockStockTransactions)[number];