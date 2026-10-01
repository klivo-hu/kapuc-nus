import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { env } from '@/lib/env';
import { fontVariables } from './fonts';
import { ROOT_HEAD_SCRIPT } from './head-script';
import './globals.css';

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(env.siteUrl),
    manifest: '/manifest.webmanifest',
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#f7f1e8',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hu" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ROOT_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
