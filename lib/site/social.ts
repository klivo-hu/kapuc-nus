import type { SocialSettings } from '@/lib/content/settings-schema';

export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok' | 'other';

export interface SocialLink {
  readonly network: SocialNetwork;
  readonly label: string;
  readonly url: string;
}

/** Only the accounts the café has entered, in a fixed order. */
export function socialLinks(social: SocialSettings): SocialLink[] {
  const links: SocialLink[] = [];
  if (social.instagram)
    links.push({ network: 'instagram', label: 'Instagram', url: social.instagram });
  if (social.facebook) links.push({ network: 'facebook', label: 'Facebook', url: social.facebook });
  if (social.tiktok) links.push({ network: 'tiktok', label: 'TikTok', url: social.tiktok });
  for (const other of social.others)
    links.push({ network: 'other', label: other.label, url: other.url });
  return links;
}
