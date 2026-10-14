// components/website/footer.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Wrench,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/lib/store/settings-store';
import { STORE_HOURS, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

const SHOP_LINKS = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?category=Power%20Tools', label: 'Power Tools' },
  { href: '/shop?category=Hand%20Tools', label: 'Hand Tools' },
  { href: '/shop?category=Accessories', label: 'Accessories' },
  { href: '/shop?category=Safety', label: 'Safety Gear' },
  { href: '/shop?category=Measuring', label: 'Measuring' },
];

const HELP_LINKS = [
  { href: '/help', label: 'Delivery & Click & Collect' },
  { href: '/help#returns', label: 'Returns & Refunds' },
  { href: '/help#warranty', label: 'Warranty' },
  { href: '/register', label: 'Trade Account' },
  { href: '/my-orders', label: 'Track My Order' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact & Stores' },
  { href: '/help#privacy', label: 'Privacy Policy' },
  { href: '/help#terms', label: 'Terms of Sale' },
];

const SOCIAL = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

export function WebsiteFooter() {
  const { businessInfo } = useSettingsStore();
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thanks — you are subscribed to our trade specials');
    setEmail('');
  };

  return (
    <footer className="mt-auto bg-primary text-primary-foreground/80">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container mx-auto py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-bold text-primary-foreground">
              Weekly tool specials, straight to your inbox
            </h3>
            <p className="text-xs md:text-sm text-primary-foreground/60">
              Power tool deals, new arrivals and job-site tips. Unsubscribe any time.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex gap-2 w-full md:w-auto md:min-w-[380px]">
            <Input
              type="email"
              placeholder="you@company.com.au"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 flex-1 bg-white/5 border-white/15 text-primary-foreground placeholder:text-primary-foreground/40"
              aria-label="Email address"
            />
            <Button
              type="submit"
              className="h-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Subscribe
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="container mx-auto py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground text-primary flex items-center justify-center">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <div className="text-base font-extrabold text-primary-foreground">
                  Southern Cross
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mt-1">
                  Tools &amp; Hardware
                </div>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm">
              Professional power tools, hand tools, safety gear and measuring equipment for
              Australian builders, trades and DIY enthusiasts. Pricing shown in AUD including GST.
            </p>
            <div className="flex items-center gap-1">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-9 w-9 rounded-md flex items-center justify-center text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Help" links={HELP_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
            <div>
              <div className="font-semibold text-primary-foreground">Head office &amp; showroom</div>
              <div className="text-primary-foreground/60">{businessInfo.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
            <div>
              <div className="font-semibold text-primary-foreground">Call us</div>
              <div className="text-primary-foreground/60">{businessInfo.phone}</div>
              <div className="text-primary-foreground/60 text-xs mt-0.5">
                Trade enquiries: {SUPPORT_PHONE_DISPLAY}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
            <div>
              <div className="font-semibold text-primary-foreground">Opening hours</div>
              {STORE_HOURS.map((h) => (
                <div key={h.days} className="text-primary-foreground/60 text-xs">
                  {h.days}: {h.hours}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>
              © {new Date().getFullYear()} {businessInfo.name}.
            </span>
            <span className="hidden sm:inline">·</span>
            <span>{businessInfo.vatNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/40">
            <Mail className="h-3.5 w-3.5" />
            <span>{businessInfo.email}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
