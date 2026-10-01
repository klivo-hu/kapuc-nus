import Link from 'next/link';
import type { ReactNode } from 'react';
import { typeset } from '@/lib/format/typeset';

/**
 * A deliberately small Markdown renderer for admin-edited long-form text (the legal pages):
 * `##`/`###` headings, `-` and `1.` lists, paragraphs, `**bold**`, and `[text](url)` links.
 *
 * It builds React elements — never HTML strings — so nothing typed in the admin can inject
 * markup, and links are only emitted for http(s) and site-relative targets.
 */

type Block = { kind: 'h2' | 'h3' | 'p'; text: string } | { kind: 'ul' | 'ol'; items: string[] };

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let paragraph: string[] = [];
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null;

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    if (list) blocks.push(list);
    paragraph = [];
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flush();
      continue;
    }
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: heading[1] === '##' ? 'h2' : 'h3', text: heading[2] ?? '' });
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (paragraph.length > 0 || (list && list.kind !== kind)) flush();
      list ??= { kind, items: [] };
      list.items.push((bullet ?? numbered)?.[1] ?? '');
      continue;
    }
    if (list) flush();
    paragraph.push(line);
  }
  flush();
  return blocks;
}

function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Inline formatting: **bold** and [text](url). Everything else is plain text. */
export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${n++}`;
    if (match[1] !== undefined) {
      nodes.push(<strong key={key}>{match[1]}</strong>);
    } else {
      const label = match[2] ?? '';
      const href = safeHref(match[3] ?? '');
      if (!href) nodes.push(label);
      else if (href.startsWith('/'))
        nodes.push(
          <Link key={key} href={href}>
            {label}
          </Link>,
        );
      else
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>,
        );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { readonly source: string }) {
  // Short words are bound to the next word before parsing; the Markdown syntax is unaffected.
  return (
    <>
      {parseBlocks(typeset(source)).map((block, index) => {
        const key = `b${index}`;
        switch (block.kind) {
          case 'h2':
            return <h2 key={key}>{renderInline(block.text, key)}</h2>;
          case 'h3':
            return <h3 key={key}>{renderInline(block.text, key)}</h3>;
          case 'ul':
          case 'ol': {
            const Tag = block.kind;
            return (
              <Tag key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </Tag>
            );
          }
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </>
  );
}
