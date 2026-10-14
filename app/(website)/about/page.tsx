// app/(website)/about/page.tsx

import Link from 'next/link';
import { ArrowRight, Hammer, ShieldCheck, Users, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VALUES = [
  { icon: Wrench, title: 'Tools that last', body: 'We stock tools that job-site crews rely on every day, from cordless drills to angle grinders.' },
  { icon: ShieldCheck, title: 'Genuine & warranted', body: 'Every product is sourced through authorised channels and backed by the manufacturer warranty.' },
  { icon: Users, title: 'Advice from people who use tools', body: 'Our team has trade and DIY backgrounds, so you get straight answers before you buy.' },
  { icon: Hammer, title: 'Fair, transparent pricing', body: 'Prices are shown in AUD including GST. No hidden fees, and free delivery over $150.' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-950 via-brand-700 to-brand-600 text-white">
        <div className="container mx-auto py-14 md:py-20 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safety-300">About us</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">Built on the tools people trust.</h1>
          <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
            Southern Cross Tools supplies builders, tradespeople and home renovators across Australia with
            professional-grade power tools, hand tools, safety equipment and measuring instruments.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border bg-card p-6">
              <div className="h-11 w-11 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center">
                <v.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="container mx-auto py-12 md:py-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold">Ready to gear up?</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse the full range or talk to our team about trade pricing.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="h-11"><Link href="/shop">Shop all tools <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button asChild variant="outline" className="h-11"><Link href="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
