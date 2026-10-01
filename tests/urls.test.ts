import { describe, expect, it } from 'vitest';
import { displayUrl, isHttpUrl, parseMapEmbed } from '@/lib/validation/urls';

const EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1s0x47404d7b8c769f77';

describe('isHttpUrl', () => {
  it('accepts http and https', () => {
    expect(isHttpUrl('https://www.instagram.com/kapucinus')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
  });

  it('refuses script and data URLs, and non-URLs', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<b>x</b>')).toBe(false);
    expect(isHttpUrl('instagram.com/kapucinus')).toBe(false);
  });
});

describe('parseMapEmbed', () => {
  it('accepts a bare embed URL', () => {
    expect(parseMapEmbed(EMBED)).toBe(EMBED);
  });

  it('extracts the src from the iframe snippet Google Maps hands out', () => {
    const snippet = `<iframe src="${EMBED.replace(/&/g, '&amp;')}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
    expect(parseMapEmbed(snippet)).toBe(EMBED);
  });

  it('refuses anything that is not an https Google Maps embed', () => {
    expect(parseMapEmbed('https://evil.example/maps/embed?pb=1')).toBeNull();
    expect(parseMapEmbed('http://www.google.com/maps/embed?pb=1')).toBeNull();
    expect(parseMapEmbed('https://www.google.com/search?q=kave')).toBeNull();
    expect(parseMapEmbed('<iframe src="javascript:alert(1)"></iframe>')).toBeNull();
    expect(parseMapEmbed('')).toBeNull();
  });
});

describe('displayUrl', () => {
  it('drops the protocol, www, and trailing slash', () => {
    expect(displayUrl('https://www.instagram.com/kapucinus/')).toBe('instagram.com/kapucinus');
  });
});
