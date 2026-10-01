import { describe, expect, it } from 'vitest';
import { optionalInteger } from '@/lib/admin/form-data';
import { formatPrice } from '@/lib/format/price';
import { slugify, uniqueSlug } from '@/lib/format/slug';
import { paragraphs } from '@/lib/format/text';
import { variantWidthsFor } from '../lib/media/encode.mjs';

describe('formatPrice', () => {
  it('follows Hungarian grouping (none for four digits) and keeps the currency on the line', () => {
    expect(formatPrice(1290)).toBe('1290\u00a0Ft');
    expect(formatPrice(12900)).toMatch(/^12\s900\u00a0Ft$/);
    expect(formatPrice(650)).toBe('650\u00a0Ft');
  });
});

describe('optionalInteger', () => {
  const form = (value: string) => {
    const data = new FormData();
    data.set('price', value);
    return data;
  };

  it('reads prices as people type them', () => {
    expect(optionalInteger(form('1290'), 'price')).toBe(1290);
    expect(optionalInteger(form('1 290'), 'price')).toBe(1290);
    expect(optionalInteger(form('1.290 Ft'), 'price')).toBe(1290);
  });

  it('treats empty as unset and garbage as invalid', () => {
    expect(optionalInteger(form(''), 'price')).toBeNull();
    expect(optionalInteger(form('ingyen'), 'price')).toBeNaN();
    expect(optionalInteger(form('12,5'), 'price')).toBeNaN();
  });
});

describe('slugify', () => {
  it('folds Hungarian accents, including ő and ű', () => {
    expect(slugify('Hideg italok')).toBe('hideg-italok');
    expect(slugify('Sütemények & Torták')).toBe('sutemenyek-tortak');
    expect(slugify('Őszi különlegességek')).toBe('oszi-kulonlegessegek');
  });

  it('makes a taken slug unique', () => {
    const taken = new Set(['kave', 'kave-2']);
    expect(uniqueSlug('Kávé', (slug) => taken.has(slug))).toBe('kave-3');
  });
});

describe('paragraphs', () => {
  it('splits on blank lines and drops empty ones', () => {
    expect(paragraphs('Első.\n\n\nMásodik sor\nfolytatás.\n  \n')).toEqual([
      'Első.',
      'Második sor\nfolytatás.',
    ]);
  });
});

describe('variantWidthsFor', () => {
  it('never upscales, and always includes the full-resolution width', () => {
    expect(variantWidthsFor(1080)).toEqual([480, 800, 1080]);
    expect(variantWidthsFor(3000)).toEqual([480, 800, 1200, 1600, 2000]);
    expect(variantWidthsFor(320)).toEqual([320]);
  });
});
