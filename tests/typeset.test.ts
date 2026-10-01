import { describe, expect, it } from 'vitest';
import { typeset } from '@/lib/format/typeset';

const NBSP = ' ';

describe('typeset', () => {
  it('binds short Hungarian words to the next word', () => {
    expect(typeset('A teljes kínálat az étlapon és az itallapon vár.')).toBe(
      `A${NBSP}teljes kínálat az${NBSP}étlapon és${NBSP}az${NBSP}itallapon vár.`,
    );
    expect(typeset('Ha ez kell, egy kávé s egy szelet torta')).toBe(
      `Ha${NBSP}ez${NBSP}kell, egy${NBSP}kávé s${NBSP}egy${NBSP}szelet torta`,
    );
  });

  it('leaves longer words, word endings, and the last word alone', () => {
    expect(typeset('azt mondta, hogy jó')).toBe(`azt mondta, hogy jó`);
    expect(typeset('kávé a')).toBe('kávé a');
  });

  it('keeps a spaced dash with the word before it', () => {
    expect(typeset('Kávé – reggel')).toBe(`Kávé${NBSP}– reggel`);
  });

  it('keeps intentional line breaks and Markdown syntax intact', () => {
    expect(typeset('első a\nmásodik')).toBe('első a\nmásodik');
    expect(typeset('## A cím\n- az [a link](/x)')).toBe(
      `## A${NBSP}cím\n- az${NBSP}[a${NBSP}link](/x)`,
    );
  });

  it('passes empty values through', () => {
    expect(typeset('')).toBe('');
    expect(typeset(undefined)).toBeUndefined();
  });
});
