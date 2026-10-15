// components/website/newsletter-form.tsx

'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thanks — check your inbox for 10% off');
    setEmail('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[380px]"
    >
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-11 flex-1 rounded-md border-2 border-transparent bg-white/95 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
      <Button
        type="submit"
        size="lg"
        className="h-11 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        Get 10% off
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </form>
  );
}
