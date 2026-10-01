import 'server-only';
import { revalidatePath } from 'next/cache';

/** Every content change is live on the public site at once: drop all cached route payloads. */
export function revalidateSite(): void {
  revalidatePath('/', 'layout');
}
