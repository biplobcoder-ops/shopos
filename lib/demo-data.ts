// lib/demo-data.ts

import type {
  Product,
  Customer,
  Supplier,
  Order,
  Sale,
  Purchase,
  Expense,
  StockMovement,
  Category,
  Brand,
  Unit,
  ExpenseCategory,
  LedgerEntry,
} from './types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const phoneAU = (i: number) => {
  const rest = String(10000000 + i * 137).slice(-8);
  return `+61 4${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 8)}`;
};

const emailFor = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '') + '@example.com.au';

/* ------------------------------------------------------------------ */
/* Categories / Brands / Units                                         */
/* ------------------------------------------------------------------ */

export const demoCategories: Category[] = [
  { id: 'cat-power', name: 'Power Tools', description: 'Drills, grinders, saws and more', createdAt: daysAgo(180) },
  { id: 'cat-hand', name: 'Hand Tools', description: 'Hammers, wrenches, screwdrivers', createdAt: daysAgo(180) },
  { id: 'cat-access', name: 'Accessories', description: 'Bits, blades, discs and consumables', createdAt: daysAgo(180) },
  { id: 'cat-safety', name: 'Safety', description: 'Helmets, gloves, goggles and vests', createdAt: daysAgo(180) },
  { id: 'cat-measure', name: 'Measuring', description: 'Tapes, levels, calipers and meters', createdAt: daysAgo(180) },
];

export const demoBrands: Brand[] = [
  { id: 'brand-bosch', name: 'Bosch', description: 'German engineering power tools', createdAt: daysAgo(180) },
  { id: 'brand-makita', name: 'Makita', description: 'Japanese professional tools', createdAt: daysAgo(180) },
  { id: 'brand-dewalt', name: 'DeWalt', description: 'American tough tools', createdAt: daysAgo(180) },
  { id: 'brand-stanley', name: 'Stanley', description: 'Classic hand tools', createdAt: daysAgo(180) },
  { id: 'brand-taparia', name: 'Taparia', description: 'Indian hand tools', createdAt: daysAgo(180) },
  { id: 'brand-bd', name: 'Black+Decker', description: 'Everyday power tools', createdAt: daysAgo(180) },
  { id: 'brand-generic', name: 'Generic', description: 'Value-for-money tools', createdAt: daysAgo(180) },
];

export const demoUnits: Unit[] = [
  { id: 'unit-pc', name: 'Piece', shortName: 'pc', createdAt: daysAgo(180) },
  { id: 'unit-box', name: 'Box', shortName: 'box', createdAt: daysAgo(180) },
  { id: 'unit-set', name: 'Set', shortName: 'set', createdAt: daysAgo(180) },
  { id: 'unit-kg', name: 'Kilogram', shortName: 'kg', createdAt: daysAgo(180) },
  { id: 'unit-m', name: 'Meter', shortName: 'm', createdAt: daysAgo(180) },
  { id: 'unit-pkt', name: 'Packet', shortName: 'pkt', createdAt: daysAgo(180) },
];

/* ------------------------------------------------------------------ */
/* Products (55 items) — Prices in AUD with images                    */
/* ------------------------------------------------------------------ */

type Seed = [string, string, string, number, number, string, string]; // + Unsplash ID

// [name, category, brand, purchasePrice, sellingPrice, unitShort, unsplashId]
const productSeeds: Seed[] = [
  // ---------------- POWER TOOLS ----------------
  ['Bosch Impact Drill 500W', 'Power Tools', 'Bosch', 109, 129, 'pc', 'photo-1504148455328-c376907d081c'],
  ['Bosch Rotary Hammer 800W', 'Power Tools', 'Bosch', 220, 265, 'pc', 'photo-1572981779307-38b8cabb2407'],
  ['Bosch Angle Grinder 4 inch', 'Power Tools', 'Bosch', 82, 99, 'pc', 'photo-1503387762-592deb58ef4e'],
  ['Bosch Jigsaw 550W', 'Power Tools', 'Bosch', 125, 149, 'pc', 'photo-1581092160562-40aa08e78837'],
  ['Bosch Circular Saw 1400W', 'Power Tools', 'Bosch', 195, 235, 'pc', 'photo-1572981779307-38b8cabb2407'],
  ['Makita Angle Grinder 720W', 'Power Tools', 'Makita', 79, 95, 'pc', 'photo-1504148455328-c376907d081c'],
  ['Makita Cordless Drill 18V', 'Power Tools', 'Makita', 285, 345, 'pc', 'photo-1503387762-592deb58ef4e'],
  ['Makita Sander 300W', 'Power Tools', 'Makita', 105, 125, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Makita Heat Gun 1800W', 'Power Tools', 'Makita', 135, 165, 'pc', 'photo-1572981779307-38b8cabb2407'],
  ['DeWalt Circular Saw 1800W', 'Power Tools', 'DeWalt', 155, 185, 'pc', 'photo-1504148455328-c376907d081c'],
  ['DeWalt Reciprocating Saw', 'Power Tools', 'DeWalt', 205, 245, 'pc', 'photo-1572981779307-38b8cabb2407'],
  ['DeWalt Impact Driver 20V', 'Power Tools', 'DeWalt', 255, 305, 'pc', 'photo-1581092160562-40aa08e78837'],
  ['DeWalt Air Compressor 2HP', 'Power Tools', 'DeWalt', 295, 339, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Black+Decker Drill 550W', 'Power Tools', 'Black+Decker', 89, 105, 'pc', 'photo-1503387762-592deb58ef4e'],
  ['Black+Decker Blower 600W', 'Power Tools', 'Black+Decker', 68, 82, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Welding Machine Inverter 200A', 'Power Tools', 'Generic', 189, 229, 'pc', 'photo-1504328345606-18bbc8c9d7d1'],
  ['Air Compressor 3HP Portable', 'Power Tools', 'Generic', 279, 339, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Bench Grinder 6 inch', 'Power Tools', 'Generic', 95, 115, 'pc', 'photo-1504148455328-c376907d081c'],

  // ---------------- HAND TOOLS ----------------
  ['Stanley Claw Hammer 16oz', 'Hand Tools', 'Stanley', 11, 13, 'pc', 'photo-1586864387967-d02ef85d93e8'],
  ['Stanley Screwdriver Set 6pc', 'Hand Tools', 'Stanley', 9, 12, 'set', 'photo-1530124566582-a618bc2615dc'],
  ['Stanley Adjustable Wrench 10 inch', 'Hand Tools', 'Stanley', 13, 16, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Stanley Pliers Set 3pc', 'Hand Tools', 'Stanley', 12, 15, 'set', 'photo-1580901368919-7738efb0f87e'],
  ['Stanley Utility Knife', 'Hand Tools', 'Stanley', 4.5, 6, 'pc', 'photo-1586864387967-d02ef85d93e8'],
  ['Taparia Wrench Set 12pc', 'Hand Tools', 'Taparia', 16, 19, 'set', 'photo-1580901368919-7738efb0f87e'],
  ['Taparia Combination Plier 8 inch', 'Hand Tools', 'Taparia', 7.5, 9.5, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Taparia Screwdriver Set 8pc', 'Hand Tools', 'Taparia', 9.5, 12, 'set', 'photo-1530124566582-a618bc2615dc'],
  ['Taparia Hex Key Set 9pc', 'Hand Tools', 'Taparia', 6, 8, 'set', 'photo-1530124566582-a618bc2615dc'],
  ['Stanley Chisel Set 4pc', 'Hand Tools', 'Stanley', 13.5, 17.5, 'set', 'photo-1586864387967-d02ef85d93e8'],
  ['Stanley Hacksaw 12 inch', 'Hand Tools', 'Stanley', 6, 8, 'pc', 'photo-1586864387967-d02ef85d93e8'],
  ['Stanley Tape Measure 5m', 'Hand Tools', 'Stanley', 5, 7, 'pc', 'photo-1580901368919-7738efb0f87e'],

  // ---------------- ACCESSORIES ----------------
  ['Bosch Drill Bit Set 15pc', 'Accessories', 'Bosch', 13, 17, 'set', 'photo-1572981779307-38b8cabb2407'],
  ['Bosch Grinding Disc 4 inch (10pc)', 'Accessories', 'Bosch', 14.5, 19, 'pkt', 'photo-1504148455328-c376907d081c'],
  ['Makita Cutting Disc 4 inch (10pc)', 'Accessories', 'Makita', 12, 16, 'pkt', 'photo-1504148455328-c376907d081c'],
  ['DeWalt Saw Blade 7 inch', 'Accessories', 'DeWalt', 9.5, 13, 'pc', 'photo-1572981779307-38b8cabb2407'],
  ['Bit Set 50pc Screwdriver', 'Accessories', 'Generic', 6, 7, 'set', 'photo-1530124566582-a618bc2615dc'],
  ['Drill Chuck Key 13mm', 'Accessories', 'Generic', 3, 4.5, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Welding Rod 3.2mm (5kg)', 'Accessories', 'Generic', 14.5, 19, 'box', 'photo-1504328345606-18bbc8c9d7d1'],
  ['Grinding Wheel 7 inch', 'Accessories', 'Generic', 4.5, 6.5, 'pc', 'photo-1504148455328-c376907d081c'],
  ['Sandpaper Sheet (50pc)', 'Accessories', 'Generic', 3.5, 5, 'pkt', 'photo-1581092918056-0c4c3acd3789'],

  // ---------------- SAFETY ----------------
  ['Safety Helmet Yellow', 'Safety', 'Generic', 6, 7, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Safety Helmet White', 'Safety', 'Generic', 6, 7, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Work Gloves Leather', 'Safety', 'Generic', 2.5, 3, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Safety Goggles Clear', 'Safety', 'Generic', 3.5, 5, 'pc', 'photo-1581092160562-40aa08e78837'],
  ['Ear Protection Muff', 'Safety', 'Generic', 7.5, 10, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Safety Vest Reflective', 'Safety', 'Generic', 4.5, 6.5, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Safety Shoes Steel Toe', 'Safety', 'Generic', 22, 28, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Dust Mask N95 (10pc)', 'Safety', 'Generic', 3, 4, 'pkt', 'photo-1581092918056-0c4c3acd3789'],
  ['First Aid Kit Small', 'Safety', 'Generic', 13, 18, 'set', 'photo-1581092918056-0c4c3acd3789'],

  // ---------------- MEASURING ----------------
  ['Measuring Tape 5m Stanley', 'Measuring', 'Stanley', 5, 7, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Measuring Tape 10m Stanley', 'Measuring', 'Stanley', 9.5, 12, 'pc', 'photo-1580901368919-7738efb0f87e'],
  ['Spirit Level 24 inch', 'Measuring', 'Generic', 12, 16, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Digital Vernier Caliper', 'Measuring', 'Generic', 19, 25, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Laser Distance Meter 40m', 'Measuring', 'Generic', 65, 82, 'pc', 'photo-1581092160562-40aa08e78837'],
  ['Infrared Thermometer', 'Measuring', 'Generic', 28, 37, 'pc', 'photo-1581092918056-0c4c3acd3789'],
  ['Angle Finder Digital', 'Measuring', 'Generic', 14.5, 19, 'pc', 'photo-1581092918056-0c4c3acd3789'],
];

const makeBarcode = (i: number) => {
  // EAN-13 with 93 (Australia GS1 prefix)
  const base = '93' + String(100000000 + i).slice(-10);
  return base.slice(0, 13);
};

/* ------------------------------------------------------------------ */
/* Unsplash URL builder                                                */
/* ------------------------------------------------------------------ */

const unsplashUrl = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const demoProducts: Product[] = productSeeds.map((seed, i) => {
  const [name, category, brand, purchasePrice, sellingPrice, unitShort, unsplashId] = seed;
  const minStock = randomInt(5, 15);
  let stock: number;
  if (i % 17 === 0) stock = 0;
  else if (i % 11 === 0) stock = randomInt(1, minStock);
  else stock = randomInt(minStock + 5, minStock + 60);

  const sku = `SKU-${String(i + 1).padStart(4, '0')}`;
  // Unsplash first, local SVG as fallback
  const image = unsplashUrl(unsplashId, 600);
  const fallbackImage = `/images/products/${sku.toLowerCase()}.svg`;

  return {
    id: `prod-${String(i + 1).padStart(3, '0')}`,
    name,
    sku,
    barcode: makeBarcode(i + 1),
    category,
    brand,
    unit: unitShort,
    purchasePrice,
    sellingPrice,
    stock,
    minStock,
    grade: i % 5 === 0 ? 'A' : i % 3 === 0 ? 'B' : 'C',
    image,
    // store fallback separately if your type supports it
    description: `${name} — professional grade tool suitable for construction and DIY use. Backed by manufacturer warranty. All prices include GST.`,
    status: 'active' as const,
    createdAt: daysAgo(180 - i),
  };
});

/* ------------------------------------------------------------------ */
/* (Rest of the file remains unchanged — Customers, Suppliers, Orders, */
/*  Sales, Purchases, Expenses, Stock movements, Ledgers)              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Customers (22) — Australian                                        */
/* ------------------------------------------------------------------ */

const customerNames = [
  'Sydney Builders Supply',
  'Melbourne Construction Co',
  'Brisbane Hardware Hub',
  'Perth Construction Supplies',
  'Adelaide Trade Centre',
  'Newcastle Tools Direct',
  'Wollongong Steel Co',
  'Geelong Builders',
  'Hobart Building Supplies',
  'Darwin Hardware Co',
  'Cairns Tool Centre',
  'Townsville Engineering',
  'Ballarat Builders Hub',
  'Bendigo Traders',
  'Toowoomba Hardware',
  'Wagga Wagga Constructions',
  'Parramatta Tools & Supply',
  'Chatswood Building Materials',
  'Penrith Hardware',
  'Sutherland Enterprises',
  'Wilson & Sons Pty Ltd',
  'Thompson Traders Pty Ltd',
];

const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Newcastle', 'Wollongong', 'Geelong'];
const auStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export const demoCustomers: Customer[] = customerNames.map((name, i) => {
  const totalPurchase = randomInt(5000, 120000);
  const paid = totalPurchase - randomInt(0, 15000);
  const due = Math.max(0, totalPurchase - paid);
  const state = auStates[i % auStates.length];
  const city = cities[i % cities.length];
  return {
    id: `cust-${String(i + 1).padStart(3, '0')}`,
    name,
    phone: phoneAU(i),
    email: emailFor(name),
    address: `${randomInt(1, 200)} ${pick(['George', 'Pitt', 'Collins', 'Bourke', 'Elizabeth', 'King', 'Queen'])} Street`,
    suburb: city,
    state,
    postcode: String(randomInt(2000, 8000)),
    country: 'Australia',
    due,
    paid,
    totalPurchase,
    createdAt: daysAgo(150 - i * 5),
  };
});

/* ------------------------------------------------------------------ */
/* Suppliers (12) — Australian                                        */
/* ------------------------------------------------------------------ */

const supplierNames = [
  'Bosch Australia Pty Ltd',
  'Makita Australia',
  'DeWalt Australia',
  'Stanley Black & Decker AU',
  'Taparia Tools Australia',
  'Black+Decker Australia',
  'Sydney Tools Wholesale',
  'Melbourne Tool House',
  'Australian Hardware Imports',
  'Power Tool Distributors AU',
  'National Hardware Supply AU',
  'Metro Tools & Machinery AU',
];

export const demoSuppliers: Supplier[] = supplierNames.map((name, i) => {
  const totalPurchase = randomInt(20000, 200000);
  const paid = totalPurchase - randomInt(0, 30000);
  const due = Math.max(0, totalPurchase - paid);
  const state = auStates[i % auStates.length];
  return {
    id: `sup-${String(i + 1).padStart(3, '0')}`,
    name,
    contactPerson: pick(['Mr. Smith', 'Ms. Jones', 'Mr. Wilson', 'Ms. Brown', 'Mr. Taylor']),
    phone: phoneAU(i + 40),
    email: emailFor(name),
    address: `${randomInt(1, 100)} ${pick(['Industrial', 'Trade', 'Commerce'])} ${pick(['Drive', 'Avenue', 'Road'])}, ${cities[i % cities.length]} ${state}`,
    suburb: cities[i % cities.length],
    state,
    postcode: String(randomInt(2000, 8000)),
    country: 'Australia',
    due,
    paid,
    totalPurchase,
    createdAt: daysAgo(200 - i * 10),
  };
});

/* ------------------------------------------------------------------ */
/* Orders (30)                                                         */
/* ------------------------------------------------------------------ */

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'] as const;
const orderCounts = { pending: 5, processing: 8, shipped: 7, delivered: 10 };

export const demoOrders: Order[] = (() => {
  const out: Order[] = [];
  let idx = 1;
  for (const status of orderStatuses) {
    for (let k = 0; k < orderCounts[status]; k++) {
      const cust = demoCustomers[(idx - 1) % demoCustomers.length];
      const itemCount = randomInt(1, 4);
      const items = Array.from({ length: itemCount }).map(() => {
        const p = pick(demoProducts);
        const qty = randomInt(1, 3);
        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          price: p.sellingPrice,
          qty,
          subtotal: p.sellingPrice * qty,
        };
      });
      const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
      const delivery = pick([9.95, 14.95, 19.95]);
      const total = subtotal + delivery;
      out.push({
        id: `order-${String(idx).padStart(3, '0')}`,
        orderNo: `ORD-${String(1000 + idx)}`,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerEmail: cust.email,
        items,
        subtotal,
        delivery,
        total,
        status,
        deliveryAddress: cust.address || 'Sydney',
        deliverySuburb: cust.suburb,
        deliveryState: cust.state,
        deliveryPostcode: cust.postcode,
        deliveryCountry: 'Australia',
        paymentMethod: pick(['card', 'paypal', 'afterpay', 'applepay']),
        date: daysAgo(randomInt(1, 45), randomInt(9, 20)),
      });
      idx++;
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* ------------------------------------------------------------------ */
/* Sales (52)                                                          */
/* ------------------------------------------------------------------ */

const cashiers = ['cashier@shop.com', 'manager@shop.com', 'admin@shop.com'];

export const demoSales: Sale[] = (() => {
  const out: Sale[] = [];
  for (let i = 0; i < 52; i++) {
    const isWalkIn = i % 3 === 0;
    const cust = isWalkIn ? null : demoCustomers[i % demoCustomers.length];
    const itemCount = randomInt(1, 5);
    const items = Array.from({ length: itemCount }).map(() => {
      const p = pick(demoProducts);
      const qty = randomInt(1, 4);
      const discount = i % 5 === 0 ? randomInt(2, 10) : 0;
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        price: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        qty,
        discount,
        subtotal: p.sellingPrice * qty - discount,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const discount = i % 7 === 0 ? randomInt(5, 25) : 0;
    const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;
    const due = i % 6 === 0 ? randomInt(0, Math.floor(total * 0.5)) : 0;
    const paid = Math.round((total - due) * 100) / 100;
    out.push({
      id: `sale-${String(i + 1).padStart(3, '0')}`,
      invoiceNo: `INV-${String(5000 + i + 1)}`,
      customerId: cust?.id ?? null,
      customerName: cust?.name ?? 'Walk-in Customer',
      items,
      subtotal,
      discount,
      tax,
      total,
      paid,
      due,
      paymentMethod: due > 0 ? 'due' : pick(['cash', 'card', 'paypal', 'afterpay', 'applepay']),
      cashier: pick(cashiers),
      date: daysAgo(randomInt(0, 60), randomInt(9, 20)),
      status: 'completed',
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* ------------------------------------------------------------------ */
/* Purchases (30)                                                      */
/* ------------------------------------------------------------------ */

export const demoPurchases: Purchase[] = (() => {
  const out: Purchase[] = [];
  for (let i = 0; i < 30; i++) {
    const sup = demoSuppliers[i % demoSuppliers.length];
    const itemCount = randomInt(2, 6);
    const items = Array.from({ length: itemCount }).map(() => {
      const p = pick(demoProducts);
      const qty = randomInt(3, 20);
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        purchasePrice: p.purchasePrice,
        qty,
        subtotal: p.purchasePrice * qty,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const discount = i % 4 === 0 ? randomInt(10, 80) : 0;
    const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;
    const due = i % 3 === 0 ? randomInt(0, Math.floor(total * 0.4)) : 0;
    const paid = Math.round((total - due) * 100) / 100;
    out.push({
      id: `pur-${String(i + 1).padStart(3, '0')}`,
      purchaseNo: `PUR-${String(3000 + i + 1)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      items,
      subtotal,
      discount,
      tax,
      total,
      paid,
      due,
      date: daysAgo(randomInt(1, 90), randomInt(9, 18)),
      status: 'received',
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* ------------------------------------------------------------------ */
/* Expense categories + Expenses (25)                                  */
/* ------------------------------------------------------------------ */

export const demoExpenseCategories: ExpenseCategory[] = [
  { id: 'exp-rent', name: 'Rent', description: 'Shop rent', createdAt: daysAgo(180) },
  { id: 'exp-salary', name: 'Salary', description: 'Staff salaries', createdAt: daysAgo(180) },
  { id: 'exp-util', name: 'Utility', description: 'Electricity, water, internet', createdAt: daysAgo(180) },
  { id: 'exp-trans', name: 'Transport', description: 'Delivery & transport', createdAt: daysAgo(180) },
  { id: 'exp-misc', name: 'Misc', description: 'Miscellaneous', createdAt: daysAgo(180) },
];

export const demoExpenses: Expense[] = Array.from({ length: 25 }).map((_, i) => {
  const cat = demoExpenseCategories[i % demoExpenseCategories.length];
  return {
    id: `exp-${String(i + 1).padStart(3, '0')}`,
    categoryId: cat.id,
    categoryName: cat.name,
    amount: randomInt(80, 800),
    note: `${cat.name} expense #${i + 1}`,
    date: daysAgo(randomInt(1, 60), randomInt(9, 18)),
    createdBy: 'admin@shop.com',
  };
});

/* ------------------------------------------------------------------ */
/* Stock movements                                                     */
/* ------------------------------------------------------------------ */

export const demoStockMovements: StockMovement[] = (() => {
  const out: StockMovement[] = [];

  demoSales.forEach((sale) => {
    sale.items.forEach((it, j) => {
      const p = demoProducts.find((p) => p.id === it.productId);
      if (!p) return;
      out.push({
        id: `mv-sale-${sale.id}-${j}`,
        productId: p.id,
        productName: p.name,
        type: 'sale',
        qty: -it.qty,
        before: p.stock + it.qty,
        after: p.stock,
        reference: sale.invoiceNo,
        user: sale.cashier,
        date: sale.date,
      });
    });
  });

  demoPurchases.forEach((pur) => {
    pur.items.forEach((it, j) => {
      const p = demoProducts.find((p) => p.id === it.productId);
      if (!p) return;
      out.push({
        id: `mv-pur-${pur.id}-${j}`,
        productId: p.id,
        productName: p.name,
        type: 'purchase',
        qty: it.qty,
        before: Math.max(0, p.stock - it.qty),
        after: p.stock,
        reference: pur.purchaseNo,
        user: 'admin@shop.com',
        date: pur.date,
      });
    });
  });

  for (let i = 0; i < 15; i++) {
    const p = pick(demoProducts);
    const qty = pick([-3, -2, -1, 1, 2, 3, 5]);
    out.push({
      id: `mv-adj-${i + 1}`,
      productId: p.id,
      productName: p.name,
      type: 'adjustment',
      qty,
      before: p.stock,
      after: p.stock + qty,
      reference: `ADJ-${String(100 + i)}`,
      note: qty < 0 ? 'Damaged in transit' : 'Found in stock count',
      user: 'admin@shop.com',
      date: daysAgo(randomInt(1, 90), randomInt(9, 18)),
    });
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* ------------------------------------------------------------------ */
/* Customer / Supplier ledgers                                         */
/* ------------------------------------------------------------------ */

export const demoLedger: LedgerEntry[] = (() => {
  const out: LedgerEntry[] = [];

  demoCustomers.forEach((c) => {
    const entries = randomInt(2, 6);
    let balance = 0;
    for (let i = 0; i < entries; i++) {
      const isSale = i % 2 === 0;
      const amount = isSale ? randomInt(200, 3000) : randomInt(100, 1500);
      const paid = isSale ? (i % 3 === 0 ? 0 : amount) : 0;
      balance += amount - paid;
      out.push({
        id: `led-c-${c.id}-${i}`,
        partnerId: c.id,
        partnerType: 'customer',
        type: isSale ? 'sale' : 'payment',
        reference: isSale ? `INV-${randomInt(5000, 5200)}` : `PAY-${randomInt(200, 300)}`,
        amount,
        paid,
        balance: Math.max(0, balance),
        date: daysAgo(randomInt(1, 90), randomInt(10, 18)),
      });
    }
  });

  demoSuppliers.forEach((s) => {
    const entries = randomInt(2, 5);
    let balance = 0;
    for (let i = 0; i < entries; i++) {
      const isPurchase = i % 2 === 0;
      const amount = isPurchase ? randomInt(1000, 8000) : randomInt(500, 4000);
      const paid = isPurchase ? (i % 3 === 0 ? 0 : amount) : 0;
      balance += amount - paid;
      out.push({
        id: `led-s-${s.id}-${i}`,
        partnerId: s.id,
        partnerType: 'supplier',
        type: isPurchase ? 'purchase' : 'payment',
        reference: isPurchase
          ? `PUR-${randomInt(3000, 3100)}`
          : `PAY-${randomInt(200, 300)}`,
        amount,
        paid,
        balance: Math.max(0, balance),
        date: daysAgo(randomInt(1, 90), randomInt(10, 18)),
      });
    }
  });

  return out;
})();
