# Southern Cross Tools — Australian Construction Tools Storefront + POS

A demo of a construction-tools business in Australia: a responsive public
website (desktop + mobile) and a staff POS / back-office system.
Inspired by the layout patterns of large Australian hardware & tools retailers
(utility bar, category navigation, promo banners, trade account, click & collect),
but using its own fictional brand, colours and artwork.

- Currency: AUD, prices shown GST-inclusive (10%)
- Delivery: free over $150, flat $12.95 otherwise (see `lib/constants.ts`)
- Demo images: generated locally (no internet needed) in `public/images/`

## Public website (`app/(website)`)

| Route | Page |
|---|---|
| `/` | Homepage: hero, service band, categories, brands, top picks, trade banner, new arrivals |
| `/shop` | Product listing with desktop sidebar filters and mobile filter sheet (`?q=`, `?category=`) |
| `/product/[id]` | Product detail, quantity, add to cart / buy now, specs |
| `/cart`, `/checkout` | Cart with free-delivery progress; checkout with AU states and 4-digit postcode |
| `/my-orders` | Order history (per browser, no login) |
| `/register` | Trade account enquiry (demo) |
| `/about`, `/contact`, `/help` | Company, contact form (demo) and delivery / returns / warranty policies |

Responsive breakpoints: utility bar and category strip show on tablet/desktop;
a slide-out menu and search bar cover mobile.

## Staff system (`app/(dashboard)`)

Login at `/login`. Password for all demo accounts is `1234`.

| Role | Email |
|---|---|
| Admin | admin@shop.com |
| Manager | manager@shop.com |
| Cashier | cashier@shop.com |
| Stockman | stock@shop.com |

POS, inventory, purchases, sales/returns, customers & suppliers, orders,
expenses, reports and settings all work in the browser (localStorage).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Requires Node.js 18.18+ (Next.js 14).

### Environment (optional for the demo)
```
NEXTAUTH_SECRET=any-random-string
NEXTAUTH_URL=http://localhost:3000
```

## Demo images

Product, category and hero artwork are SVG files generated from the product list:

```bash
python3 scripts/generate-product-images.py .
```

Output: `public/images/products/sku-XXXX.svg`, `public/images/categories/*.svg`,
`public/images/hero-tools.svg`. To use real photos, drop a file with the same
name into `public/images/products/` (or set `image` to an absolute path such as
`/images/products/my-photo.jpg` in `lib/demo-data.ts`).

## Data & reset

All data lives in browser localStorage (Zustand persist). Use
**Settings → Backup → Reset All Data** to reload the demo catalogue after changing
seed data, because existing browser data takes priority over the seeds.

## Before going live (placeholders to replace)

- Business name, ABN, address, phone and email — `lib/store/settings-store.ts`
  and `lib/constants.ts`
- Delivery, returns, warranty, privacy and terms wording — `app/(website)/help/page.tsx`
- Store hours — `STORE_HOURS` in `lib/constants.ts`
- Fictional brand logo (the "SC" wrench mark) — `components/website/navbar.tsx`
- Contact form and newsletter currently only show a confirmation (no backend)
- Payments (Card / PayPal / Afterpay / Bank) are UI only; no gateway is connected

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zustand ·
react-hook-form + Zod · Recharts · @react-pdf/renderer · NextAuth (Credentials)
