// app/(website)/contact/page.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/lib/store/settings-store';
import { STORE_HOURS, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

export default function ContactPage() {
  const { businessInfo } = useSettingsStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: 'General enquiry', message: '' });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 5) {
      toast.error('Please add your name, a valid email and a short message');
      return;
    }
    setSubmitting(true);
    // Demo only: no backend. Message is acknowledged locally.
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Thanks — our team will reply within one business day');
      setForm({ name: '', email: '', phone: '', topic: 'General enquiry', message: '' });
    }, 600);
  };

  return (
    <div>
      <section className="bg-brand-950 text-white">
        <div className="container mx-auto py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-safety-300">Contact &amp; stores</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">We're here to help.</h1>
          <p className="mt-3 text-white/75 max-w-xl">Product questions, bulk quotes, trade accounts or delivery queries — send us a note or give us a call.</p>
        </div>
      </section>

      <section className="container mx-auto py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        <form onSubmit={submit} className="rounded-xl border bg-card p-5 md:p-8 space-y-5">
          <h2 className="text-lg font-bold">Send us a message</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Full name *</Label>
              <Input id="c-name" value={form.name} onChange={update('name')} className="h-11" autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" value={form.email} onChange={update('email')} className="h-11" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" type="tel" value={form.phone} onChange={update('phone')} placeholder="04XX XXX XXX" className="h-11" autoComplete="tel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-topic">Topic</Label>
              <select
                id="c-topic"
                value={form.topic}
                onChange={update('topic')}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {['General enquiry', 'Product advice', 'Trade account', 'Order or delivery', 'Returns & warranty'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-msg">Message *</Label>
            <Textarea id="c-msg" rows={6} value={form.message} onChange={update('message')} />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full md:w-auto md:px-10" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>

        <aside className="space-y-4">
          <InfoCard icon={MapPin} title="Showroom & head office" lines={[businessInfo.address]} />
          <InfoCard icon={Phone} title="Phone" lines={[businessInfo.phone, `Trade line: ${SUPPORT_PHONE_DISPLAY}`]} />
          <InfoCard icon={Mail} title="Email" lines={[businessInfo.email]} />
          <InfoCard icon={Clock} title="Opening hours" lines={STORE_HOURS.map((h) => `${h.days}: ${h.hours}`)} />
        </aside>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, lines }: { icon: React.ComponentType<{ className?: string }>; title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-safety-600" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}
