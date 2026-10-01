'use client';

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/cn';

function Submit({ label, compact }: { label: string; compact: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex items-center gap-2 rounded-md text-danger transition-colors hover:bg-danger/10 disabled:opacity-50',
        compact ? 'size-9 justify-center' : 'h-10 px-4 text-small font-medium',
      )}
    >
      <Trash2 aria-hidden className="size-4" />
      <span className={compact ? 'sr-only' : undefined}>{pending ? 'Törlés…' : label}</span>
    </button>
  );
}

/** Deletes after an explicit confirmation — the only irreversible action in the admin. */
export function DeleteButton({
  action,
  label = 'Törlés',
  confirmText,
  compact = false,
}: {
  readonly action: () => Promise<void>;
  readonly label?: string;
  readonly confirmText: string;
  readonly compact?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <Submit label={label} compact={compact} />
    </form>
  );
}
