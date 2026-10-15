// app/(website)/account/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  LogOut,
  Package,
  Home,
  Building2,
  MapPinned,
  Hash,
  Globe,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '@/lib/store/customer-auth-store';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, logout } = useCustomerAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account');
    }
  }, [isAuthenticated, router]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPostcode(user.postcode || '');
      setLoaded(true);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate tiny delay for UX
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postcode: postcode.trim(),
      });
      setSaving(false);
      toast.success('Profile updated successfully');
    }, 350);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  // Get initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  // Loading / not-authenticated state
  if (!isAuthenticated || !user || !loaded) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            My Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and account settings
          </p>
        </div>

        {/* User card */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{user.name}</h2>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link href="/my-orders">
                <Package className="h-4 w-4 mr-2" />
                My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link href="/shop">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile form */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6 md:p-8 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold">Profile Information</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Update your personal details below
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address{' '}
                <span className="text-muted-foreground font-normal">(cannot be changed)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 h-11 bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">
                Street address <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Suburb + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-medium">
                  Suburb / City
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sydney"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-sm font-medium">
                  State
                </Label>
                <div className="relative">
                  <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NSW"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Postcode */}
            <div className="space-y-1.5">
              <Label htmlFor="postcode" className="text-sm font-medium">
                Postcode
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="2000"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Save button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={saving}
                className="h-11 font-semibold flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-destructive">Sign out</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can log back in anytime
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="h-10 shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}