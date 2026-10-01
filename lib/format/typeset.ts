/**
 * Hungarian line breaking for public text. A one- or two-letter word (a, az, e, ez, s, és, ha,
 * de, ne, se, ó, ő…) and the article "egy" never end a line: each is bound to the word after it
 * with a no-break space. A dash set between spaces stays with the word before it.
 *
 * Applied where text is rendered, never where it is stored: the admin edits plain spaces.
 */
const NBSP = ' ';

/**
 * A short word: preceded by the start, whitespace, or opening punctuation (including Markdown's
 * `[` and `*`); followed by a space and more text.
 */
const SHORT_WORD = /(?<=^|[\s(„"'“‘–—/[*])(\p{L}{1,2}|egy)[ \t]+(?=\S)/giu;
/** A spaced en or em dash: the space before it must not break. */
const SPACED_DASH = /[ \t]+([–—])(?=\s)/g;

export function typeset(text: string): string;
export function typeset(text: string | null | undefined): string | undefined;
export function typeset(text: string | null | undefined): string | undefined {
  if (!text) return text ?? undefined;
  return text.replace(SHORT_WORD, `$1${NBSP}`).replace(SPACED_DASH, `${NBSP}$1`);
}
