# Project Memory — kapucinus

> Persistent institutional memory for this project. Read before deciding; update after
> significant work. Managed with the CEF Memory Engine.

## Project summary

Kapucinus Kávézó (Hatvan, HU): a premium café website with a built-in admin (CMS).
Created 2026-09-30 with CEF 0.1.0 (`cef create` → `cef blueprint` → `cef consent init` →
`cef generate --preset elegant --theme base --client-slug kapucinus`), then built out by hand.
Primary language: hu. Country: HU.

## Architecture

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind 3 (CEF tokens), GSAP 3 +
  ScrollTrigger + SplitText (registered once in `lib/motion/gsap.ts`).
- Data: SQLite via better-sqlite3 (`lib/db/`), one WAL connection, migrations by `user_version`,
  first-boot seed from the café's own photographs (`lib/db/seed.ts`, `assets/seed/`).
- Media: uploads re-encoded by sharp to AVIF + WebP at 480–2000 px (`lib/media/encode.mjs`),
  served immutable from `/media/<id>/<w>.<ext>`; OG crops at `/media/<id>/og.jpg`.
- Route groups: `app/(site)` (public, with header/footer/curtain/consent) and
  `app/admin/(panel)` (authenticated). Public pages render per request (`force-dynamic`).
- Auth: env-configured single admin (scrypt hash), DB-backed sessions (HMAC of a random token),
  httpOnly SameSite=Strict cookie, middleware pre-gate + `requireAdmin()` in every action.
- Docker: CEF platform contract (port 80, `hosting_kapucinus_web`, `client_kapucinus_net`) plus a
  named volume `kapucinus_data` at `/app/data`.

## Decisions

- **[2026-09-30] Scope follows the brief, not the blueprint.** CEF's hospitality blueprint planned
  reservations, signup, a dashboard, and a contact page. The brief asks for home, menu, about,
  gallery, three legal pages, and an admin; the generated extras were removed (user instruction
  outranks the blueprint).
- **[2026-09-30] SQLite + better-sqlite3, no ORM.** A single-café CMS with low write volume and
  one container. Alternatives: Postgres (rejected: a second service the platform would have to
  run) and a JSON file store (rejected: no transactions or constraints). Recorded in the
  manifest as `database: sqlite`.
- **[2026-09-30] Custom admin instead of a headless CMS.** Sanity/Contentful/Payload would add a
  third-party account or a second service for ~8 content types. `cms: none` in the manifest.
- **[2026-09-30] Brand palette replaces the CEF base theme.** No CEF theme fits (luxury is purple,
  creative rose). Palette sampled from the logo (#5C392D on #F6E9D6) and extended with pastel
  brown and coffee browns, with the café's grey-green as a sparing accent; tokens live in `styles/tokens.css` under CEF names
  (`--cef-color-*`, `--cef-text-*`, `--cef-space-*`). All text pairings checked to AA.
- **[2026-09-30] Type system.** Newsreader (editorial serif, opsz), Instrument Sans (UI/body, the
  CEF elegant pairing's sans), and a decorative script. All latin-ext for ő/ű. Literata (CEF
  default serif) replaced by Newsreader for display.
- **[2026-09-30] Higgsfield unavailable → procedural latte art.** The Decision Engine names the
  Higgsfield MCP for bespoke imagery; it did not respond. Fallback: `scripts/latte-art.mjs`
  renders a raster ripple-heart latte (fractal-noise crema, displacement-warped foam, seeded
  jitter) at build time. Not an inline SVG illustration (IM-013).
- **[2026-09-30] No invented business data.** Street address, phone, e-mail, opening hours,
  prices, social accounts, and operator/company details were not provided and are left empty;
  the public site hides empty fields and the admin dashboard lists them as tasks. City (Hatvan),
  the map embed, the directions query, and the place link derive from the Maps embed the client
  supplied.
- **[2026-09-30] Motion level 2.** Reveals and stagger only on scroll; the hero carousel, the
  intro curtain, the mobile menu, and the lightbox are authored timelines, not scroll effects.
  Unused level-3 presets were removed from `lib/motion/scroll-presets.ts`.
- **[2026-09-30] Elements awaiting a reveal fade with opacity, not autoAlpha,** where they hold
  focusable controls (gallery tiles, mobile-menu links), so keyboard users can always reach them.
- **[2026-10-01] Client feedback round 1: palette, transitions, script, line breaks.**
  - *Palette.* The green bands are gone. The café's own grey-green **#5B625A** (sampled from the
    client's reference `alap_szín.jpg`; tokens `sage-*`/`forest-*`) is used sparingly: the
    footer surface, the focus ring, dietary notes. Brown sections (`espresso-800`, the text
    brown #402A21) carry cream text; `.surface-dark` switches the focus ring and selection to
    cream there (the grey-green ring is only 2.1:1 on brown). Footer secondary text is cream-200
    (5.1:1 on #5B625A; sage-200 would be 4.3:1).
  - *Section transitions.* The SVG waves were rejected ("a hullám nem jó"). Replaced by
    `components/site/coffee-edge.tsx`: a build-time raster (`scripts/coffee-edge.mjs`) of coffee
    diffusing into milk — domain-warped fractal noise, a density ramp sampled from the client's
    iced-coffee reference, drooping plumes, filaments, a few drops. Two pours (seeds 11 and 5),
    AVIF/WebP at 1440 and 2880 px (~30 KB AVIF). The solid brown along the edge is pinned to the
    section colour; the edge sits in flow and only reaches into neighbours' empty padding. The
    intro curtain is the same brown and trails the same edge as it lifts. The footer has a plain
    top edge: the coffee splash belongs to the brown, not to the grey-green.
  - *Script.* Ms Madi's "z" reads as a Cyrillic "з"; replaced by **Oooh Baby** (plain latin z,
    clear ő/ű). The home "about" note now sits below its photograph, never over it.
  - *Hero rotation.* Auto-advances every 8 s. Holds only for: the pause button, keyboard focus on
    the hero's controls (`:focus-visible`), a hidden tab (resumes on return). A resting mouse no
    longer pauses it, and reduced motion no longer stops it (it crossfades instead) — the pause
    button satisfies WCAG 2.2.2.
  - *Line breaks.* `lib/format/typeset.ts` binds one- and two-letter words and "egy" to the next
    word with a no-break space (Hungarian typographic rule: no "a", "az", "ez", "ha" at a line
    end) and keeps spaced dashes with the word before. Applied at render time to all public
    text, legal Markdown, and consent copy; stored text stays plain.
- **[2026-09-30] Consent: necessary + functional (Google Maps).** Window placed bottom-right so it
  never covers the hero text; waits for the intro curtain; map loads only after consent, with an
  inline opt-in on the map itself.

## Waivers (recorded per CEF review)

- **IM-007 Cream default surface (advisory).** Deliberate: the logo sits on cream and the brief
  asks for "krémes törtfehér". Chosen for this brand, not by reflex.
- **IM-051 Color outside the palette (advisory).** `scripts/latte-art.mjs` and
  `scripts/coffee-edge.mjs` hold the artworks' pigments (not UI colors; the coffee ramp is sampled
  from the client's iced-coffee photograph); `app/layout.tsx` theme-color and the media fallback color are token
  values written as literals because a meta tag / SQL default cannot read CSS variables.
- **SEO: `public/llms.txt`, `app/opengraph-image.tsx`, `public/schema.json`.** `llms.txt` is a
  route (`app/llms.txt/route.ts`) built from settings; share images are chosen per page in the CMS
  (a file-based OG image would override them); structured data is inline JSON-LD per page.
- **SEO: `public/security.txt`.** Requires a real security contact; none provided.
- **SEO: admin pages without canonical.** Admin is `noindex` (header + metadata).
- **Content: "Internal link … has no matching page".** The CEF content reviewer does not resolve
  Next.js route groups (`app/(site)/…`); every link resolves at runtime (verified by HTTP).
- **Architecture: `.mjs` imports via `@/`.** CEF's resolver appends `.ts` to every specifier;
  tests import the shared `.mjs` modules by relative path instead.
- **Legal: Terms of Service.** The site sells nothing and takes no bookings online, so no ÁSZF
  is required. Revisit if online ordering is added.

## Outstanding tasks

- [ ] Client: fill the admin dashboard's open items (address, hours, phone/e-mail, prices,
      social links, a real team photo, operator details, legal effective date).
- [ ] Legal review of the privacy and cookie notices by a qualified professional.
- [ ] Human read-through of the Hungarian copy and brand sign-off.
- [ ] Docker build + run verification (Docker Desktop was not running on the build machine).
- [ ] `cef approve` workflow (human only).

## Known constraints

- Legal documents are drafts and MUST be reviewed by a qualified legal professional.
- Product names/descriptions were written from the photographs; the café should confirm them.
