// components/pos/customer-selector.tsx

'use client';

import { useState } from 'react';
import { User, UserPlus, X, Check } from 'lucide-react';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

export function CustomerSelector() {
  const customers = useCustomerStore((s) => s.customers);
  const addCustomer = useCustomerStore((s) => s.add);
  const { customer, setCustomer } = useCartStore();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const created = addCustomer({
      name,
      phone: newPhone.trim() || '—',
      due: 0,
      paid: 0,
      totalPurchase: 0,
    });
    setCustomer(created);
    setNewName('');
    setNewPhone('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-10 text-sm font-normal"
        >
          <User className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <span className={cn('truncate', !customer && 'text-muted-foreground')}>
            {customer?.name ?? 'Walk-in Customer'}
          </span>
          {customer && (
            <X
              className="ml-auto h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setCustomer(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        {!creating ? (
          <Command>
            <CommandInput placeholder="Search customer..." />
            <CommandList>
              <CommandEmpty>No customers found.</CommandEmpty>
              <CommandGroup heading="Customers">
                <CommandItem
                  value="__walkin__"
                  onSelect={() => {
                    setCustomer(null);
                    setOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Walk-in Customer</span>
                  {!customer && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
                {customers.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.name + ' ' + c.phone}
                    onSelect={() => {
                      setCustomer(c);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {c.phone}
                        {c.due > 0 ? ` · Due ${formatCurrency(c.due)}` : ''}
                      </span>
                    </div>
                    {customer?.id === c.id && <Check className="ml-2 h-4 w-4 shrink-0" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => setCreating(true)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-2" />
                Add new customer
              </Button>
            </div>
          </Command>
        ) : (
          <div className="p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Customer
            </div>
            <Input
              placeholder="Name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="h-9"
            />
            <Input
              placeholder="Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="h-9"
            />
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}