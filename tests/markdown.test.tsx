import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown, parseBlocks } from '@/components/legal/markdown';

describe('parseBlocks', () => {
  it('recognizes headings, lists, and paragraphs', () => {
    const blocks = parseBlocks(
      '## Cím\n\nElső sor\nfolytatás.\n\n- egy\n- kettő\n\n1. első\n2. második',
    );
    expect(blocks).toEqual([
      { kind: 'h2', text: 'Cím' },
      { kind: 'p', text: 'Első sor folytatás.' },
      { kind: 'ul', items: ['egy', 'kettő'] },
      { kind: 'ol', items: ['első', 'második'] },
    ]);
  });
});

describe('Markdown', () => {
  it('renders bold text and safe links', () => {
    render(<Markdown source="Lásd **fontos** és [NAIH](https://naih.hu)." />);
    expect(screen.getByText('fontos').tagName).toBe('STRONG');
    const link = screen.getByRole('link', { name: 'NAIH' });
    expect(link.getAttribute('href')).toBe('https://naih.hu/');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('never turns a script URL into a link, and never renders raw HTML', () => {
    const { container } = render(
      <Markdown source={'[kattints](javascript:alert(1)) <img src=x onerror=alert(1)>'} />,
    );
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('kattints');
  });
});
