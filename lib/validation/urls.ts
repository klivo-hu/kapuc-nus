/**
 * URL rules for anything an administrator types that ends up in an href or an iframe src.
 * Only http(s) is ever accepted, so a `javascript:` or `data:` value can never reach the page.
 */

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const MAP_EMBED_HOSTS = new Set(['www.google.com', 'google.com', 'maps.google.com']);

/**
 * Accepts either the embed URL itself or the whole `<iframe …>` snippet Google Maps hands out
 * under Share → Embed a map, and returns the embed URL — or null when it is not a Google Maps
 * embed. The iframe's other attributes are discarded; the site renders its own.
 */
export function parseMapEmbed(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const fromSnippet = /src\s*=\s*["']([^"']+)["']/i.exec(trimmed)?.[1];
  const candidate = (fromSnippet ?? trimmed).replace(/&amp;/g, '&');
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return null;
    if (!MAP_EMBED_HOSTS.has(url.hostname)) return null;
    if (!url.pathname.startsWith('/maps/embed')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** A display form of a URL for link text: host and path, no protocol, no trailing slash. */
export function displayUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, '')}${url.pathname}`.replace(/\/$/, '');
  } catch {
    return value;
  }
}
