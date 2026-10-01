import type { ImageAsset } from '@/lib/content/types';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',');

/** A quick check before sending, so an obviously wrong file fails at once. The server re-checks. */
export function precheckImage(file: File, maxBytes: number): string | null {
  if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type))
    return 'Csak JPG, PNG, WebP vagy AVIF kép tölthető fel.';
  if (file.size > maxBytes)
    return `A kép legfeljebb ${Math.round(maxBytes / 1024 / 1024)} MB lehet.`;
  return null;
}

/**
 * Uploads one image to /api/admin/upload. XMLHttpRequest rather than fetch, because only XHR
 * reports upload progress; `onProgress` receives 0–1 while bytes are sent.
 */
export function uploadImage(
  file: File,
  onProgress: (fraction: number) => void,
): Promise<ImageAsset> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/upload');
    request.responseType = 'json';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      const response = request.response as { media?: ImageAsset; error?: string } | null;
      if (request.status >= 200 && request.status < 300 && response?.media) resolve(response.media);
      else if (request.status === 401)
        reject(new Error('A munkamenet lejárt. Jelentkezz be újra.'));
      else reject(new Error(response?.error ?? 'A feltöltés nem sikerült.'));
    };
    request.onerror = () => reject(new Error('Hálózati hiba a feltöltés közben.'));
    request.send(body);
  });
}
