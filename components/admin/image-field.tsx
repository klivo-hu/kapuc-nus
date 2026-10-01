'use client';

import { ImagePlus, Images, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, type DragEvent } from 'react';
import { setFocalPointAction } from '@/app/admin/(panel)/shared-actions';
import { Button } from '@/components/ui/button';
import { ACCEPT_ATTRIBUTE, precheckImage, uploadImage } from '@/lib/admin/upload-client';
import { cn } from '@/lib/cn';
import type { ImageAsset } from '@/lib/content/types';
import { mediaUrl, pickWidth } from '@/lib/media/urls';
import { MediaLibrary } from './media-library';

interface ImageFieldProps {
  readonly name: string;
  readonly label: string;
  readonly initial: ImageAsset | null;
  readonly maxBytes: number;
  readonly hint?: string;
  /** Shape of the preview, matching where the image is used ("4/5", "16/9"). */
  readonly aspect?: string;
}

/**
 * Chooses the image for a piece of content: upload a new one (with progress), pick one already
 * uploaded, or clear it. The chosen image's id travels with the form in a hidden input. Clicking
 * the preview sets the focal point — the spot every crop of this image keeps in frame.
 */
export function ImageField({
  name,
  label,
  initial,
  maxBytes,
  hint,
  aspect = '4/5',
}: ImageFieldProps) {
  const [image, setImage] = useState<ImageAsset | null>(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const problem = precheckImage(file, maxBytes);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setProgress(0);
    try {
      setImage(await uploadImage(file, setProgress));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'A feltöltés nem sikerült.');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setFocal = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!image) return;
    const box = event.currentTarget.getBoundingClientRect();
    const focalX = Math.round(((event.clientX - box.left) / box.width) * 100);
    const focalY = Math.round(((event.clientY - box.top) / box.height) * 100);
    setImage({ ...image, focalX, focalY });
    await setFocalPointAction(image.id, focalX, focalY);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files[0]);
  };

  return (
    <div>
      <p id={`${id}-label`} className="text-small font-medium text-foreground">
        {label}
      </p>
      {hint ? <p className="mt-1 text-meta text-muted">{hint}</p> : null}
      <input type="hidden" name={name} value={image?.id ?? ''} />

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'relative w-full max-w-[15rem] overflow-hidden rounded-lg bg-cream-200 ring-2 ring-transparent transition-shadow',
            dragging && 'ring-mocha-700',
          )}
          style={{ aspectRatio: aspect }}
        >
          {image ? (
            <button
              type="button"
              onClick={setFocal}
              className="absolute inset-0 cursor-crosshair"
              aria-describedby={`${id}-focal`}
            >
              <img
                src={mediaUrl(image.id, pickWidth(image, 480), 'webp')}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  objectPosition: `${image.focalX}% ${image.focalY}%`,
                  backgroundColor: image.color,
                }}
              />
              <span
                aria-hidden
                className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream-50 bg-mocha-700/60 shadow-md"
                style={{ left: `${image.focalX}%`, top: `${image.focalY}%` }}
              />
              <span className="sr-only">Fókuszpont beállítása</span>
            </button>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-meta text-muted">
              <ImagePlus aria-hidden className="size-7" />
              Húzd ide a képet, vagy válassz lent.
            </div>
          )}
          {progress !== null ? (
            <div className="absolute inset-x-0 bottom-0 bg-cream-50/95 p-3">
              <div
                role="progressbar"
                aria-label="Feltöltés"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                className="h-1.5 overflow-hidden rounded-full bg-cream-300"
              >
                <div
                  className="h-full bg-mocha-700 transition-[width]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-meta text-foreground">
                {progress < 1 ? `Feltöltés… ${Math.round(progress * 100)}%` : 'Feldolgozás…'}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            id={`${id}-file`}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            onChange={(event) => void upload(event.target.files?.[0])}
            aria-labelledby={`${id}-label ${id}-upload`}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="size-4" />}
            disabled={progress !== null}
            onClick={() => inputRef.current?.click()}
          >
            <span id={`${id}-upload`}>{image ? 'Csere új képre' : 'Kép feltöltése'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Images className="size-4" />}
            onClick={() => setLibraryOpen(true)}
          >
            Választás a feltöltöttek közül
          </Button>
          {image ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="size-4" />}
              onClick={() => setImage(null)}
            >
              Kép eltávolítása
            </Button>
          ) : null}
          <p id={`${id}-focal`} className="max-w-xs text-meta text-muted">
            {image
              ? 'Kattints a képre, hogy kijelöld a fókuszpontot: a kivágások ezt a részt tartják középen.'
              : `JPG, PNG, WebP vagy AVIF, legfeljebb ${Math.round(maxBytes / 1024 / 1024)} MB.`}
          </p>
          {error ? (
            <p role="alert" className="text-meta font-medium text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <MediaLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(selected) => {
          setImage(selected);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}
