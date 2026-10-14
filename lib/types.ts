// lib/types.ts

export type Role = 'admin' | 'manager' | 'cashier' | 'stockman';

export type Permission =
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'sales:own'
  | 'purchase'
  | 'orders'
  | 'products'
  | 'products:view'
  | 'products:edit'
  | 'inventory'
  | 'barcode'
  | 'customers'
  | 'suppliers'
  | 'reports'
  | 'expense'
  | 'users'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

// ---------- Catalog ----------

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  name: string;
  shortName?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  grade?: string;
  image?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// ---------- Partners ----------

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
  due: number;
  paid: number;
  totalPurchase: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
  due: number;
  paid: number;
  totalPurchase: number;
  createdAt: string;
}

// ---------- Transactions ----------

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  purchasePrice: number;
  qty: number;
  discount: number;
  stock: number;
}

export interface HeldCart {
  id: string;
  items: CartItem[];
  customerId: string | null;
  discount: number;
  createdAt: string;
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'paypal'
  | 'afterpay'
  | 'applepay'
  | 'bank'
  | 'due';

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  purchasePrice: number;
  qty: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: PaymentMethod;
  cashier: string;
  date: string;
  status: 'completed' | 'returned' | 'partial-return';
}

export interface SaleReturn {
  id: string;
  saleId: string;
  invoiceNo: string;
  items: SaleItem[];
  amount: number;
  reason: string;
  date: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  sku: string;
  purchasePrice: number;
  qty: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
  date: string;
  status: 'received' | 'returned' | 'partial-return';
  notes?: string;
}

export interface PurchaseReturn {
  id: string;
  purchaseId: string;
  purchaseNo: string;
  items: PurchaseItem[];
  amount: number;
  reason: string;
  date: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliverySuburb?: string;
  deliveryState?: string;
  deliveryPostcode?: string;
  deliveryCountry?: string;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
}

// ---------- Stock ----------

export type MovementType =
  | 'sale'
  | 'purchase'
  | 'sale-return'
  | 'purchase-return'
  | 'adjustment'
  | 'stock-in'
  | 'stock-out'
  | 'order-confirm'
  | 'order-cancel';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  qty: number;
  before: number;
  after: number;
  reference: string;
  note?: string;
  user: string;
  date: string;
}

// ---------- Expense ----------

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  note?: string;
  date: string;
  createdBy: string;
}

// ---------- Payment Ledger ----------

export interface LedgerEntry {
  id: string;
  partnerId: string;
  partnerType: 'customer' | 'supplier';
  type: 'sale' | 'purchase' | 'payment' | 'return' | 'adjustment';
  reference: string;
  amount: number;
  paid: number;
  balance: number;
  date: string;
  note?: string;
}

// ---------- Settings ----------

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  vatNumber?: string;
}

export interface TaxInfo {
  enabled: boolean;
  rate: number;
  inclusive: boolean;
  vatNumber?: string;
}

export interface ReceiptInfo {
  headerText: string;
  footerText: string;
  showLogo: boolean;
  showVat: boolean;
  showCashier: boolean;
}

// ---------- Dashboard ----------

export interface DashboardStats {
  totalSales: number;
  totalPurchase: number;
  profit: number;
  totalDue: number;
  customerDue: number;
  supplierDue: number;
  stockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  todaySales: number;
  mySalesMonth?: number;
  myTransactions?: number;
}

// ---------- Table ----------

export interface TableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
}