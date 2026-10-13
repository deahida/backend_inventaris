import type { Sale } from '@/types';

export const mockSales: Sale[] = [
  { id: 1, invoice: "INV-260901-0001", date: "2026-09-01T10:30:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 17000000, discount: 0, tax: 1870000, total: 18870000, paymentAmount: 19000000, change: 130000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 1, saleId: 1, productId: 1, productName: "ASUS VivoBook 14", quantity: 2, price: 8500000, subtotal: 17000000 }
  ], createdAt: "2026-09-01T10:30:00Z" },
  { id: 2, invoice: "INV-260902-0002", date: "2026-09-02T11:15:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 9800000, discount: 0, tax: 1078000, total: 10878000, paymentAmount: 11000000, change: 122000, paymentMethod: "transfer", status: "selesai", items: [
    { id: 2, saleId: 2, productId: 3, productName: "HP Pavilion 15", quantity: 1, price: 9800000, subtotal: 9800000 }
  ], createdAt: "2026-09-02T11:15:00Z" },
  { id: 3, invoice: "INV-260903-0003", date: "2026-09-03T14:20:00Z", cashierId: 4, cashierName: "Dewi Lestari", subtotal: 1800000, discount: 0, tax: 198000, total: 1998000, paymentAmount: 2000000, change: 2000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 3, saleId: 3, productId: 9, productName: "Logitech G Pro X", quantity: 1, price: 1800000, subtotal: 1800000 }
  ], createdAt: "2026-09-03T14:20:00Z" },
  { id: 4, invoice: "INV-260904-0004", date: "2026-09-04T09:45:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 24500000, discount: 500000, tax: 2640000, total: 26640000, paymentAmount: 26640000, change: 0, paymentMethod: "debit", status: "selesai", items: [
    { id: 4, saleId: 4, productId: 2, productName: "Lenovo ThinkPad X1 Carbon", quantity: 1, price: 24500000, subtotal: 24500000 }
  ], createdAt: "2026-09-04T09:45:00Z" },
  { id: 5, invoice: "INV-260905-0005", date: "2026-09-05T13:10:00Z", cashierId: 6, cashierName: "Anisa Rahma", subtotal: 1500000, discount: 0, tax: 165000, total: 1665000, paymentAmount: 1700000, change: 35000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 5, saleId: 5, productId: 12, productName: "Samsung 970 EVO Plus 1TB", quantity: 1, price: 1500000, subtotal: 1500000 }
  ], createdAt: "2026-09-05T13:10:00Z" },
  { id: 6, invoice: "INV-260906-0006", date: "2026-09-06T16:30:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 7500000, discount: 0, tax: 825000, total: 8325000, paymentAmount: 8400000, change: 75000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 6, saleId: 6, productId: 4, productName: "Dell Inspiron 3520", quantity: 1, price: 7500000, subtotal: 7500000 }
  ], createdAt: "2026-09-06T16:30:00Z" },
  { id: 7, invoice: "INV-260907-0007", date: "2026-09-07T10:05:00Z", cashierId: 4, cashierName: "Dewi Lestari", subtotal: 3000000, discount: 0, tax: 330000, total: 3330000, paymentAmount: 3400000, change: 70000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 7, saleId: 7, productId: 13, productName: "Corsair Vengeance 16GB", quantity: 3, price: 1000000, subtotal: 3000000 }
  ], createdAt: "2026-09-07T10:05:00Z" },
  { id: 8, invoice: "INV-260908-0008", date: "2026-09-08T11:50:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 12500000, discount: 0, tax: 1375000, total: 13875000, paymentAmount: 13875000, change: 0, paymentMethod: "transfer", status: "dibatalkan", items: [
    { id: 8, saleId: 8, productId: 22, productName: "MacBook Air M1 (Refurb)", quantity: 1, price: 12500000, subtotal: 12500000 }
  ], createdAt: "2026-09-08T11:50:00Z" },
  { id: 9, invoice: "INV-260909-0009", date: "2026-09-09T14:40:00Z", cashierId: 6, cashierName: "Anisa Rahma", subtotal: 4800000, discount: 0, tax: 528000, total: 5328000, paymentAmount: 5400000, change: 72000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 9, saleId: 9, productId: 6, productName: "LG UltraGear 27", quantity: 1, price: 4800000, subtotal: 4800000 }
  ], createdAt: "2026-09-09T14:40:00Z" },
  { id: 10, invoice: "INV-260910-0010", date: "2026-09-10T15:15:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 850000, discount: 0, tax: 93500, total: 943500, paymentAmount: 1000000, change: 56500, paymentMethod: "tunai", status: "selesai", items: [
    { id: 10, saleId: 10, productId: 25, productName: "Flashdisk 32GB", quantity: 10, price: 85000, subtotal: 850000 }
  ], createdAt: "2026-09-10T15:15:00Z" },
  { id: 11, invoice: "INV-260911-0011", date: "2026-09-11T09:30:00Z", cashierId: 4, cashierName: "Dewi Lestari", subtotal: 7200000, discount: 0, tax: 792000, total: 7992000, paymentAmount: 8000000, change: 8000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 11, saleId: 11, productId: 5, productName: "Acer Aspire 5", quantity: 1, price: 7200000, subtotal: 7200000 }
  ], createdAt: "2026-09-11T09:30:00Z" },
  { id: 12, invoice: "INV-260912-0012", date: "2026-09-12T13:45:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 2500000, discount: 0, tax: 275000, total: 2775000, paymentAmount: 2800000, change: 25000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 12, saleId: 12, productId: 11, productName: "Corsair K70 RGB", quantity: 1, price: 2500000, subtotal: 2500000 }
  ], createdAt: "2026-09-12T13:45:00Z" },
  { id: 13, invoice: "INV-260913-0013", date: "2026-09-13T16:10:00Z", cashierId: 6, cashierName: "Anisa Rahma", subtotal: 3800000, discount: 0, tax: 418000, total: 4218000, paymentAmount: 4300000, change: 82000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 13, saleId: 13, productId: 21, productName: "Lenovo Ideapad 3 (Bekas)", quantity: 1, price: 3800000, subtotal: 3800000 }
  ], createdAt: "2026-09-13T16:10:00Z" },
  { id: 14, invoice: "INV-260914-0014", date: "2026-09-14T10:55:00Z", cashierId: 2, cashierName: "Siti Nurhaliza", subtotal: 1000000, discount: 0, tax: 110000, total: 1110000, paymentAmount: 1110000, change: 0, paymentMethod: "transfer", status: "selesai", items: [
    { id: 14, saleId: 14, productId: 10, productName: "Razer DeathAdder V2", quantity: 1, price: 1000000, subtotal: 1000000 }
  ], createdAt: "2026-09-14T10:55:00Z" },
  { id: 15, invoice: "INV-260915-0015", date: "2026-09-15T14:25:00Z", cashierId: 8, cashierName: "Maya Sari", subtotal: 6000000, discount: 0, tax: 660000, total: 6660000, paymentAmount: 6700000, change: 40000, paymentMethod: "tunai", status: "selesai", items: [
    { id: 15, saleId: 15, productId: 18, productName: "MSI RTX 3060", quantity: 1, price: 6000000, subtotal: 6000000 }
  ], createdAt: "2026-09-15T14:25:00Z" }
];
