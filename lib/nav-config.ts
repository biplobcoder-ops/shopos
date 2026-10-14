// lib/nav-config.ts

import type { Permission } from './types';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Truck,
  PackageCheck,
  Wrench,
  Layers,
  ScanBarcode,
  Users,
  Factory,
  BarChart3,
  Wallet,
  UserCog,
  Settings,
  // Submenu icons
  List,
  FileText,
  RotateCcw,
  PlusCircle,
  Clock,
  Package,
  CheckCircle2,
  PackageX,
  FolderTree,
  Tag,
  Ruler,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  History,
  QrCode,
  Printer,
  Camera,
  AlertCircle,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Boxes,
  Building2,
  Landmark,
  Percent,
  Save,
  Database,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavChild {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  badgeKey?: 'ordersPending' | 'lowStock' | 'customerDue' | 'supplierDue';
  children?: NavChild[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'POS',
        href: '/pos',
        icon: ShoppingCart,
        permission: 'pos',
      },
      {
        title: 'Sales',
        href: '/sales',
        icon: Receipt,
        permission: 'sales',
        children: [
          { title: 'All Sales', href: '/sales', icon: List },
          { title: 'Invoices', href: '/sales/invoices', icon: FileText },
          { title: 'Returns', href: '/sales/returns', icon: RotateCcw },
        ],
      },
      {
        title: 'Purchase',
        href: '/purchase',
        icon: Truck,
        permission: 'purchase',
        children: [
          { title: 'All Purchases', href: '/purchase', icon: List },
          { title: 'Create Purchase', href: '/purchase/create', icon: PlusCircle },
          { title: 'Returns', href: '/purchase/returns', icon: RotateCcw },
        ],
      },
      {
        title: 'Orders',
        href: '/orders',
        icon: PackageCheck,
        permission: 'orders',
        badgeKey: 'ordersPending',
        children: [
          { title: 'All Orders', href: '/orders', icon: List },
          { title: 'Pending', href: '/orders/pending', icon: Clock },
          { title: 'Processing', href: '/orders/processing', icon: Package },
          { title: 'Delivered', href: '/orders/delivered', icon: CheckCircle2 },
        ],
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        title: 'Products',
        href: '/products',
        icon: Wrench,
        permission: 'products',
        children: [
          { title: 'All Products', href: '/products', icon: Boxes },
          { title: 'Categories', href: '/products/categories', icon: FolderTree },
          { title: 'Brands', href: '/products/brands', icon: Tag },
          { title: 'Units', href: '/products/units', icon: Ruler },
        ],
      },
      {
        title: 'Inventory',
        href: '/inventory',
        icon: Layers,
        permission: 'inventory',
        badgeKey: 'lowStock',
        children: [
          { title: 'Stock Overview', href: '/inventory', icon: Boxes },
          { title: 'Stock In', href: '/inventory/stock-in', icon: ArrowDownToLine },
          { title: 'Stock Out', href: '/inventory/stock-out', icon: ArrowUpFromLine },
          { title: 'Adjustment', href: '/inventory/adjustment', icon: SlidersHorizontal },
          { title: 'Movement History', href: '/inventory/movements', icon: History },
        ],
      },
      {
        title: 'Barcode',
        href: '/barcode/generate',
        icon: ScanBarcode,
        permission: 'barcode',
        children: [
          { title: 'Generate', href: '/barcode/generate', icon: QrCode },
          { title: 'Print Labels', href: '/barcode/print', icon: Printer },
          { title: 'Scan', href: '/barcode/scan', icon: Camera },
        ],
      },
    ],
  },
  {
    label: 'Partners',
    items: [
      {
        title: 'Customers',
        href: '/customers',
        icon: Users,
        permission: 'customers',
        badgeKey: 'customerDue',
        children: [
          { title: 'All Customers', href: '/customers', icon: Users },
          { title: 'Due List', href: '/customers/due', icon: AlertCircle },
          { title: 'Payment History', href: '/customers/payments', icon: CreditCard },
        ],
      },
      {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Factory,
        permission: 'suppliers',
        badgeKey: 'supplierDue',
        children: [
          { title: 'All Suppliers', href: '/suppliers', icon: Building2 },
          { title: 'Due List', href: '/suppliers/due', icon: AlertCircle },
          { title: 'Payment History', href: '/suppliers/payments', icon: Landmark },
        ],
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        title: 'Reports',
        href: '/reports/sales',
        icon: BarChart3,
        permission: 'reports',
        children: [
          { title: 'Sales Report', href: '/reports/sales', icon: TrendingUp },
          { title: 'Purchase Report', href: '/reports/purchase', icon: ShoppingBag },
          { title: 'Stock Report', href: '/reports/stock', icon: Boxes },
          { title: 'Profit & Loss', href: '/reports/profit-loss', icon: Percent },
          { title: 'Customer Due', href: '/reports/customer-due', icon: Users },
          { title: 'Supplier Due', href: '/reports/supplier-due', icon: Factory },
        ],
      },
      {
        title: 'Expense',
        href: '/expense',
        icon: Wallet,
        permission: 'expense',
        children: [
          { title: 'All Expenses', href: '/expense', icon: List },
          { title: 'Categories', href: '/expense/categories', icon: FolderTree },
          { title: 'Reports', href: '/expense/reports', icon: BarChart3 },
        ],
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Users',
        href: '/users',
        icon: UserCog,
        permission: 'users',
        children: [
          { title: 'All Users', href: '/users', icon: Users },
          { title: 'Roles', href: '/users/roles', icon: Shield },
          { title: 'Permissions', href: '/users/permissions', icon: ShieldCheck },
        ],
      },
      {
        title: 'Settings',
        href: '/settings/business',
        icon: Settings,
        permission: 'settings',
        children: [
          { title: 'Business Info', href: '/settings/business', icon: Building2 },
          { title: 'Tax & VAT', href: '/settings/tax', icon: Percent },
          { title: 'Receipt', href: '/settings/receipt', icon: Receipt },
          { title: 'Backup', href: '/settings/backup', icon: Database },
        ],
      },
    ],
  },
];
