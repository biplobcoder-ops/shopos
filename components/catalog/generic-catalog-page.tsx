// components/catalog/generic-catalog-page.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

export interface CatalogItem {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  createdAt: string;
}

interface Props {
  title: string;
  description: string;
  itemLabel: string;
  items: CatalogItem[];
  onAdd: (data: { name: string; shortName?: string; description?: string }) => void;
  onUpdate: (id: string, data: { name?: string; shortName?: string; description?: string }) => void;
  onRemove: (id: string) => void;
  showShortName?: boolean;
  /** Optional product count map: itemName -> count */
  usageCounts?: Record<string, number>;
}

export function GenericCatalogPage({
  title,
  description,
  itemLabel,
  items,
  onAdd,
  onUpdate,
  onRemove,
  showShortName,
  usageCounts,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState<CatalogItem | null>(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [desc, setDesc] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShortName('');
    setDesc('');
    setFormOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    setName(item.name);
    setShortName(item.shortName ?? '');
    setDesc(item.description ?? '');
    setFormOpen(true);
  };

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    if (showShortName && !shortName.trim()) {
      toast.error('Short name is required');
      return;
    }

    const payload: any = { name: trimmedName, description: desc.trim() || undefined };
    if (showShortName) payload.shortName = shortName.trim();

    if (editing) {
      onUpdate(editing.id, payload);
      toast.success(`${itemLabel} updated`);
    } else {
      onAdd(payload);
      toast.success(`${itemLabel} created`);
    }
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={openCreate} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add {itemLabel}
          </Button>
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Layers}
              title={`No ${itemLabel.toLowerCase()}s yet`}
              description={`Create your first ${itemLabel.toLowerCase()}.`}
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {itemLabel}
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const count = usageCounts?.[item.name] ?? 0;
            return (
              <Card key={item.id} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {item.name}
                          </div>
                          {item.shortName && (
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {item.shortName}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-2">
                        Created {formatDate(item.createdAt)}
                        {usageCounts && ` · ${count} product${count === 1 ? '' : 's'}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => setDeleting(item)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details below.'
                : `Create a new ${itemLabel.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${itemLabel === 'Category' ? 'Power Tools' : itemLabel === 'Brand' ? 'Bosch' : 'Piece'}`}
                autoFocus
              />
            </div>
            {showShortName && (
              <div className="space-y-1.5">
                <Label htmlFor="cat-short">Short Name *</Label>
                <Input
                  id="cat-short"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. pc, box, set"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={`Delete ${itemLabel.toLowerCase()}?`}
        description={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) {
            onRemove(deleting.id);
            toast.success(`${itemLabel} deleted`);
            setDeleting(null);
          }
        }}
      />
    </div>
  );
}