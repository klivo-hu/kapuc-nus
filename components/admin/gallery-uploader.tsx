'use client';

import { CheckCircle2, CircleAlert, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState, type DragEvent } from 'react';
import { addGalleryItemAction } from '@/app/admin/(panel)/galeria/actions';
import { ACCEPT_ATTRIBUTE, precheckImage, uploadImage } from '@/lib/admin/upload-client';
import { cn } from '@/lib/cn';

interface QueueItem {
  key: string;
  name: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'done' | 'error';
  error?: string;
}

/** "limonade_terasz-2024.jpg" → "Limonade terasz 2024": a readable starting title. */
function titleFromFilename(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
}

/**
 * Several photographs at once: dropped or chosen, uploaded one after another with their own
 * progress, and added to the gallery unpublished — each waits for its alt text before it goes live.
 */
export function GalleryUploader({ maxBytes }: { readonly maxBytes: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const id = useId();
  const busy = queue.some((item) => item.status === 'uploading' || item.status === 'waiting');

  const update = (key: string, patch: Partial<QueueItem>) =>
    setQueue((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const start = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const batch = Array.from(files).map((file, index) => ({
      file,
      item: {
        key: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        progress: 0,
        status: 'waiting' as const,
      },
    }));
    setQueue((current) => [
      ...current.filter((item) => item.status !== 'done'),
      ...batch.map(({ item }) => item),
    ]);

    for (const { file, item } of batch) {
      const problem = precheckImage(file, maxBytes);
      if (problem) {
        update(item.key, { status: 'error', error: problem });
        continue;
      }
      update(item.key, { status: 'uploading' });
      try {
        const media = await uploadImage(file, (progress) => update(item.key, { progress }));
        const result = await addGalleryItemAction(media.id, titleFromFilename(file.name));
        if ('error' in result) throw new Error(result.error);
        update(item.key, { status: 'done', progress: 1 });
      } catch (error) {
        update(item.key, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Hiba történt.',
        });
      }
    }
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void start(event.dataTransfer.files);
  };

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg bg-cream-50 p-6 shadow-sm">
      <h2 id={`${id}-title`} className="font-serif text-h4 text-foreground">
        Képek feltöltése
      </h2>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-latte-500/70 px-6 py-10 text-center transition-colors',
          dragging && 'border-mocha-700 bg-cream-200',
        )}
      >
        <UploadCloud aria-hidden className="size-8 text-mocha-600" />
        <p className="text-small text-foreground">Húzd ide a képeket, vagy</p>
        <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-small font-medium text-primary-foreground hover:bg-espresso-800 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
          válassz a gépedről
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTRIBUTE}
            disabled={busy}
            onChange={(event) => void start(event.target.files)}
            className="sr-only"
          />
        </label>
        <p className="text-meta text-muted">
          JPG, PNG, WebP vagy AVIF, legfeljebb {Math.round(maxBytes / 1024 / 1024)} MB. Az új képek
          rejtve kerülnek be: alt szöveg megadása után kapcsold be őket.
        </p>
      </div>

      {queue.length > 0 ? (
        <ul className="mt-5 space-y-3" aria-live="polite">
          {queue.map((item) => (
            <li key={item.key} className="flex items-center gap-3 text-small">
              {item.status === 'done' ? (
                <CheckCircle2 aria-hidden className="size-5 shrink-0 text-forest-600" />
              ) : item.status === 'error' ? (
                <CircleAlert aria-hidden className="size-5 shrink-0 text-danger" />
              ) : (
                <span aria-hidden className="size-5 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {item.status === 'error' ? (
                <span className="text-danger">{item.error}</span>
              ) : item.status === 'done' ? (
                <span className="text-forest-700">Feltöltve</span>
              ) : (
                <span className="flex w-40 items-center gap-2">
                  <span
                    role="progressbar"
                    aria-label={`${item.name} feltöltése`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(item.progress * 100)}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-300"
                  >
                    <span
                      className="block h-full bg-mocha-700"
                      style={{ width: `${item.progress * 100}%` }}
                    />
                  </span>
                  <span className="tabular w-10 text-right text-meta text-muted">
                    {item.status === 'waiting' ? 'vár' : `${Math.round(item.progress * 100)}%`}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
