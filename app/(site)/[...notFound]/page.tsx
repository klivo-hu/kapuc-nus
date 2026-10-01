import { notFound } from 'next/navigation';

/** Any unknown public URL renders the site's own 404, inside the site's header and footer. */
export default function CatchAll(): never {
  notFound();
}
