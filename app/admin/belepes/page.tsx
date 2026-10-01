import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActionForm, FormFooter, TextField } from '@/components/admin/form';
import { hasValidSession } from '@/lib/auth/session';
import { loginAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Belépés – Kapucinus admin',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await hasValidSession()) redirect('/admin');

  return (
    <main className="grid min-h-screen place-items-center bg-cream-200 px-4 py-16">
      <div className="w-full max-w-sm">
        <img
          src="/brand/logo.png"
          width={640}
          height={150}
          alt="Kapucinus Kávézó"
          className="mx-auto h-12 w-auto"
        />
        <div className="mt-10 rounded-lg bg-cream-50 p-7 shadow-md">
          <h1 className="font-serif text-h3 text-foreground">Belépés az adminba</h1>
          <p className="mt-1 text-small text-muted">A weboldal tartalmának szerkesztéséhez.</p>
          <ActionForm action={loginAction} className="mt-7 space-y-5">
            <TextField name="username" label="Felhasználónév" autoComplete="username" required />
            <TextField
              name="password"
              label="Jelszó"
              type="password"
              autoComplete="current-password"
              required
            />
            <FormFooter submitLabel="Belépés" inline />
          </ActionForm>
        </div>
        <p className="mt-6 text-center text-small">
          <a href="/" className="text-muted underline hover:text-foreground">
            Vissza a weboldalra
          </a>
        </p>
      </div>
    </main>
  );
}
