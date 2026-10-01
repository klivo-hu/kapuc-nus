'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ImageAsset } from '@/lib/content/types';
import { mediaUrl, pickWidth } from '@/lib/media/urls';

type LibraryItem = ImageAsset & { originalName: string };

/** A modal grid of every uploaded image, for reusing one instead of uploading it again. */
export function MediaLibrary({
  open,
  onClose,
  onSelect,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (image: ImageAsset) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The native dialog is opened imperatively; the list is fetched each time it opens.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    dialog.showModal();
    setError(null);
    fetch('/api/admin/media', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('A médiatár nem tölthető be.');
        const body = (await response.json()) as { items: LibraryItem[] };
        setItems(body.items);
      })
      .catch((fetchError: unknown) =>
        setError(fetchError instanceof Error ? fetchError.message : 'Hiba történt.'),
      );
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="media-library-title"
      className="m-auto max-h-[85vh] w-[min(56rem,calc(100vw-2rem))] rounded-lg bg-cream-50 p-0 text-foreground shadow-lg backdrop:bg-espresso-900/50"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 id="media-library-title" className="font-serif text-h4">
          Feltöltött képek
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="flex size-10 items-center justify-center rounded-md hover:bg-cream-200"
        >
          <X aria-hidden className="size-5" />
          <span className="sr-only">Bezárás</span>
        </button>
      </div>
      <div className="max-h-[65vh] overflow-y-auto p-6">
        {error ? <p className="text-small text-danger">{error}</p> : null}
        {!items && !error ? <p className="text-small text-muted">Betöltés…</p> : null}
        {items && items.length === 0 ? (
          <p className="text-small text-muted">Még nincs feltöltött kép.</p>
        ) : null}
        {items && items.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group block w-full text-left"
                >
                  <img
                    src={mediaUrl(item.id, pickWidth(item, 480), 'webp')}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover ring-2 ring-transparent transition-shadow group-hover:ring-mocha-700 group-focus-visible:ring-mocha-700"
                    style={{
                      objectPosition: `${item.focalX}% ${item.focalY}%`,
                      backgroundColor: item.color,
                    }}
                  />
                  <span className="mt-1 block truncate text-meta text-muted">
                    {item.originalName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </dialog>
  );
}
