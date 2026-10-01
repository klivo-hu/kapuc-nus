# kapucinus

Project instructions for Claude Code. This is a **fullstack** built with
**nextjs** (typescript), scaffolded by the Claude Enterprise Framework (CEF).

## What this project is

Kapucínus: prémium specialty kávézó Hatvanban. Kávé, reggeli, szendvicsek, sütemények, torták, hideg italok és koktélok. Étlap és itallap, rólunk, galéria, helyszín térképpel, útvonaltervezés, nyitvatartás, közösségi média, admin tartalomkezelő (CMS) a hero slide-okhoz, termékekhez, galériához.

## How this project is organized

- `.cef/` — CEF configuration and memory. Start here.
  - `manifest.yaml` — enabled engines, skills, MCP servers, and project metadata.
  - `memory.md` — persistent project memory. **Read it before making decisions; update it after significant work.**
  - `project.json` / `runtime.json` — machine-readable project and runtime configuration.
- `app/` — routes and pages. `components/` — reusable UI. `features/` — feature modules.
- `lib/` — utilities and clients. `hooks/` — React hooks. `types/` — shared types.
- `lib/content/` — content repositories, settings schema, and the starting copy (`settings-defaults.ts`).
- `lib/db/` — SQLite client, migrations, first-boot seed. `assets/seed/` — the café's own photographs.
- `styles/tokens.css` — every design token (`--cef-*`). `scripts/` — asset preparation, password hashing.
- `tests/` — tests. `docker/` — container support. `public/` — static assets.

## Stack

- Framework: **nextjs** · Language: **typescript** · Package manager: **npm**
- Styling: **tailwind** · UI: **shadcn** · Animation: **gsap**
- Data: **SQLite (better-sqlite3)** · Auth: **built-in single admin (scrypt, DB sessions)** · CMS: **built-in admin at /admin**
- Images: **sharp → AVIF/WebP** at upload and build time
- Deployment: **Docker (Klivo platform contract, port 80, named volume `kapucinus_data`)**

## Enabled CEF engines

- accessibility
- ai-seo
- architecture
- components
- core
- deployment
- design
- docker
- experience
- legal
- motion
- performance
- platform
- security
- seo
- validation

## Conventions

- Follow the enabled engines' standards. Accessibility (WCAG 2.2 AA), security, performance,
  and legal are **floors** — never trade them away.
- Prefer server-first rendering; keep client JavaScript minimal and justified.
- Every page ships its empty, loading, and error states. No placeholder content.
- Legal documents in this project are **drafts** and must be reviewed by a qualified legal
  professional before publication.
- Never invent business data (address, hours, prices, phone, accounts, company details): leave the
  field empty; the site hides it and the admin dashboard lists it as a task.
- Decisions and recorded waivers: `.cef/memory.md`.

## Getting started

```bash
npm install
npm run dev
```

## Quality gate

`npm run verify` runs every automated gate — types, lint, formatting, and
tests — in the order CEF reviews them. Run it before reporting work complete; a failing gate
means the work is not done.
