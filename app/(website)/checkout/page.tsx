// app/(website)/checkout/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useWebCart } from '@/lib/store/web-cart-store';
import { useCustomerAuth } from '@/lib/store/customer-auth-store';
import { formatCurrency } from '@/lib/format';
import { productImage } from '@/lib/product-image';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/lib/constants';

type PaymentMethod = 'card' | 'paypal' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useWebCart();
  const items = useWebCart((s) => s.items);
  const { user, isAuthenticated } = useCustomerAuth();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('card');

  /* Mount + auth guard */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    // Prefill from user
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPostcode(user.postcode || '');
    }
  }, [mounted, isAuthenticated, items.length, user, router]);

  /* Totals */
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  /* Submit */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    // Simulate order placement
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    cart.clear();
    toast.success('Order placed successfully!');
  };

  /* Loading state (before mount) */
  if (!mounted || !isAuthenticated || items.length === 0) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* Success screen */
  if (success) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Order placed!
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Thanks for your order. We&apos;ve sent a confirmation email to{' '}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <div className="rounded-xl border bg-card p-4 sm:p-5 mt-6 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Package className="h-3.5 w-3.5" />
              Order summary
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order number</span>
              <span className="font-mono font-semibold">
                ORD-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total paid</span>
              <span className="font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium">2-5 business days</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/my-orders">View my orders</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:flex-1 h-11"
            >
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* Main checkout form */
  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Checkout
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-8">
          {/* LEFT: Form */}
          <div className="space-y-5 sm:space-y-6">
            {/* Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Contact information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full name *
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Street address *
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postcode" className="text-sm font-medium">
                      Postcode *
                    </Label>
                    <Input
                      id="postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex' },
                  { id: 'paypal', label: 'PayPal', sub: 'Pay with your PayPal account' },
                  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                ].map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                      payment === p.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={p.id}
                      checked={payment === p.id}
                      onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.sub}</div>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:sticky lg:top-20 self-start">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Items */}
                <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {items.map((it) => (
                    <li key={it.productId} className="flex gap-3">
                      <div className="h-12 w-12 rounded-md bg-muted/40 overflow-hidden shrink-0">
                        <img
                          src={productImage(it.sku)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium line-clamp-2">
                          {it.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Qty {it.qty} × {formatCurrency(it.price)}
                        </div>
                      </div>
                      <div className="text-xs font-semibold tabular-nums shrink-0">
                        {formatCurrency(it.price * it.qty)}
                      </div>
                    </li>
                  ))}
                </ul>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="tabular-nums font-medium">
                      {delivery === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        formatCurrency(delivery)
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-xl font-bold tabular-nums text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order · {formatCurrency(total)}
                    </>
                  )}
                </Button>

                {/* Trust */}
                <div className="pt-2 space-y-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Secure checkout · SSL encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Delivery in 2-5 business days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
