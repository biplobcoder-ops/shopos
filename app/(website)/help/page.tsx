// app/(website)/help/page.tsx

import Link from 'next/link';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

const SECTIONS = [
  {
    id: 'delivery',
    title: 'Delivery & Click & Collect',
    body: [
      `Standard delivery is free on orders over $${FREE_DELIVERY_THRESHOLD} (inc. GST). Orders under this amount carry a flat delivery charge of $${DELIVERY_CHARGE.toFixed(2)} (inc. GST).`,
      'Delivery is Monday to Friday, typically within 3–5 business days to metropolitan areas and longer for regional and remote postcodes.',
      'Click & Collect: choose collection at checkout and we will email you when your order is ready to pick up from our showroom.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & refunds',
    body: [
      'Unused items in original packaging can be returned within 30 days of purchase for a refund or exchange.',
      'Power tools must be returned complete with all accessories. Opened consumables (blades, discs, bits) are non-returnable for hygiene and safety reasons.',
      'Refunds go back to your original payment method within 5–10 business days of the item being received.',
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty',
    body: [
      'All products carry the manufacturer warranty. Keep your receipt or order confirmation as proof of purchase.',
      'Warranty periods vary by brand and product. Check the product packaging or contact our team for details.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'We collect only the details needed to process your orders, deliveries and enquiries. We do not sell your personal information.',
      'You can ask us to access, correct or delete your details at any time by contacting us.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of sale',
    body: [
      'All prices are in Australian dollars and include GST. Prices and availability may change without notice.',
      `For help with any order, call ${SUPPORT_PHONE_DISPLAY} or visit our contact page.`,
    ],
  },
];

export default function HelpPage() {
  return (
    <div>
      <section className="bg-brand-950 text-white">
        <div className="container mx-auto py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safety-300">Help centre</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Delivery, returns &amp; policies</h1>
          <p className="mt-3 text-white/75 max-w-xl">Everything you need to know about getting your tools and what to do if something is not right.</p>
        </div>
      </section>

      <section className="container mx-auto py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
        <nav className="lg:sticky lg:top-40 self-start flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {SECTIONS.map((s) => (
            <Link key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full lg:rounded-lg border lg:border-0 px-4 py-2 text-sm font-medium hover:bg-accent">
              {s.title}
            </Link>
          ))}
        </nav>

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="scroll-mt-40 space-y-3">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="text-sm md:text-base text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
