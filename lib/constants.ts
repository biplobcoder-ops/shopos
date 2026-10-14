// lib/constants.ts

export const APP_NAME = 'Southern Cross Tools';
export const APP_TAGLINE = 'Construction Tools & Hardware';
export const CURRENCY = 'AUD';
export const CURRENCY_SYMBOL = '$';
export const CURRENCY_LOCALE = 'en-AU';
export const PASSWORD_HINT = 'Demo password: 1234';

export const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@shop.com', role: 'admin' as const },
  { name: 'Manager User', email: 'manager@shop.com', role: 'manager' as const },
  { name: 'Cashier User', email: 'cashier@shop.com', role: 'cashier' as const },
  { name: 'Stock Manager', email: 'stock@shop.com', role: 'stockman' as const },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  stockman: 'Stock Manager',
};

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500 text-white',
  manager: 'bg-blue-500 text-white',
  cashier: 'bg-amber-500 text-white',
  stockman: 'bg-emerald-500 text-white',
};

export const PRODUCT_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Accessories',
  'Safety',
  'Measuring',
];

export const PRODUCT_BRANDS = [
  'Bosch',
  'Makita',
  'DeWalt',
  'Stanley',
  'Taparia',
  'Black+Decker',
  'Generic',
];

export const PRODUCT_UNITS = [
  { name: 'Piece', shortName: 'pc' },
  { name: 'Box', shortName: 'box' },
  { name: 'Set', shortName: 'set' },
  { name: 'Kilogram', shortName: 'kg' },
  { name: 'Meter', shortName: 'm' },
  { name: 'Packet', shortName: 'pkt' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'afterpay', label: 'Afterpay' },
  { value: 'applepay', label: 'Apple Pay' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'due', label: 'Due' },
] as const;

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-brand-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
] as const;

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Salary',
  'Utility',
  'Transport',
  'Misc',
];

export const AU_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

export const COUNTRY = 'Australia';
export const TIMEZONE = 'Australia/Sydney';

export const LOW_STOCK_THRESHOLD = 10;
export const PAGE_SIZE = 10;

export const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
];

/* ---------- Public storefront (Australia) ---------- */
export const FREE_DELIVERY_THRESHOLD = 150;   // AUD, incl. GST
export const DELIVERY_CHARGE = 12.95;         // AUD, incl. GST, metro + regional
export const GST_RATE = 0.1;                  // 10% GST, prices shown GST-inclusive
export const STORE_HOURS = [
  { days: 'Mon – Fri', hours: '7:00 am – 6:00 pm' },
  { days: 'Saturday', hours: '8:00 am – 4:00 pm' },
  { days: 'Sunday', hours: '9:00 am – 3:00 pm' },
];
export const SUPPORT_PHONE_DISPLAY = '1300 000 000';
