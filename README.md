# Kapucinus Kávézó – weboldal és admin

A Kapucinus Kávézó (Hatvan) weboldala beépített tartalomkezelővel. A Claude Enterprise Framework
(CEF) alapján készült: `cef create` → `cef blueprint` → `cef generate`, majd kézzel kiépítve.

- **Nyilvános oldal:** főoldal (intro, hero slide-ok, rólunk, kiemelt termékek, közösségi média,
  helyszín), étlap és itallap, rólunk, galéria, impresszum, adatkezelési és cookie tájékoztató.
- **Admin:** `/admin` – hero slide-ok, termékek, kategóriák, kiemelt termékek, galéria, rólunk,
  helyszín és nyitvatartás, közösségi média, weboldal és SEO, jogi adatok.

## Stack

| Réteg         | Megoldás                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| Keretrendszer | Next.js 15 (App Router), React 19, TypeScript strict                             |
| Stílus        | Tailwind CSS, design tokenek: `styles/tokens.css` (`--cef-*`)                    |
| Animáció      | GSAP 3 + ScrollTrigger + SplitText (`lib/motion/gsap.ts`)                        |
| Adat          | SQLite (better-sqlite3), migrációk: `lib/db/migrations.ts`                       |
| Képek         | sharp: minden kép AVIF + WebP változatokba kódolva, `/media/…` alatt kiszolgálva |
| Hitelesítés   | egy admin felhasználó env-ből, scrypt hash, adatbázisos munkamenet               |

## Indítás Dockerben

```bash
cp .env.example .env
# töltsd ki: ADMIN_PASSWORD_HASH (npm run admin:hash), SESSION_SECRET, SITE_URL
docker compose -f docker-compose.local.yml up --build
# http://localhost:8080 – admin: http://localhost:8080/admin
```

Éles telepítés a Klivo platformra: `docker-compose.yml` (lásd `deploy/DEPLOY.md`).
Helyi fejlesztés hot reloaddal: `docker compose -f docker-compose.dev.yml up --build`.

## Indítás Docker nélkül (Node 22+)

```bash
npm install
cp .env.example .env.local   # fejlesztéshez ADMIN_PASSWORD is használható hash helyett
npm run dev                  # http://localhost:3000
```

Az első indítás létrehozza az adatbázist a `data/` mappában, és betölti a kávézó saját fotóit
(`assets/seed/`) a kezdő tartalommal együtt.

## Környezeti változók

| Változó               | Kötelező           | Leírás                                                                 |
| --------------------- | ------------------ | ---------------------------------------------------------------------- |
| `SITE_URL`            | igen               | A nyilvános cím (canonical, sitemap, Open Graph). Futásidőben olvasva. |
| `ADMIN_USERNAME`      | igen               | Az admin felhasználóneve.                                              |
| `ADMIN_PASSWORD_HASH` | igen (élesben)     | `npm run admin:hash` kimenete.                                         |
| `ADMIN_PASSWORD`      | csak fejlesztéshez | Sima jelszó; éles környezetben elutasítva.                             |
| `SESSION_SECRET`      | igen               | Legalább 32 véletlen karakter.                                         |
| `DATA_DIR`            | nem                | Adatbázis és feltöltések helye (Dockerben `/app/data`, named volume).  |
| `MAX_UPLOAD_MB`       | nem                | Feltölthető kép max. mérete (alapértelmezés: 12).                      |
| `COOKIE_SECURE`       | nem                | `false` csak http-n futó helyi éles teszthez.                          |

## Minőségkapu

```bash
npm run verify        # típusok, lint, formázás, tesztek
npm run build         # production build (előtte: kép-assetek előkészítése)
```

CEF ellenőrzések (a CEF CLI-vel): `cef validate`, `cef impeccable detect .`,
`cef motion detect .`, `cef review`. A döntések és az indokolt kivételek: `.cef/memory.md`.

## Hol mi található

- `app/(site)/` – nyilvános oldalak; `app/admin/` – admin; `app/api/` – feltöltés, médiatár, health
- `components/` – UI (home, menu, gallery, site, admin, media, legal, motion)
- `lib/content/` – tartalom-repositoryk és a beállítások sémája (`settings-schema.ts`),
  a kezdő tartalom: `settings-defaults.ts`, `lib/db/seed-data.ts`
- `scripts/prepare-assets.mjs` – logó, favicon, latte art és seed fotók előkészítése (build előtt fut)
