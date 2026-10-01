import Link from 'next/link';

/** Fallback 404 outside the public site's layout (e.g. an unknown /admin path). */
export default function RootNotFound() {
  return (
    <main className="shell flex min-h-screen flex-col items-start justify-center gap-6 py-16">
      <h1 className="text-h1 text-foreground">Az oldal nem található</h1>
      <p className="text-lead text-muted">A keresett cím nem létezik.</p>
      <Link href="/" className="font-medium text-foreground underline">
        Vissza a főoldalra
      </Link>
    </main>
  );
}
