import type { ReactNode } from 'react';
import { PageEnter } from '@/components/motion/page-enter';

/** Re-mounted on every navigation, which is what lets PageEnter mark the page change. */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
