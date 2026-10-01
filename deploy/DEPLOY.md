# Deploying kapucinus

This project deploys on the **Klivo Docker hosting platform** (Traefik reverse proxy, one
container per site). The platform builds and runs the repository's `docker-compose.yml`.

## What is in the deploy bundle

| File                       | Purpose                                                                                                                                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dockerfile`               | Multi-stage build. `deps` → `builder` (`npm run build`: encodes the seed photographs and brand assets, builds Next.js) → `runner` (standalone server, non-root, port **80**, health check). A `dev` stage serves local hot reload only. |
| `docker-compose.yml`       | **Production.** Container `hosting_kapucinus_web`, external network `client_kapucinus_net`, `env_file: .env`, capped logs, and the named volume `kapucinus_data` at `/app/data`. No labels, no published ports, no bind mounts.         |
| `docker-compose.local.yml` | The production image on `localhost:8080` with its own volume, for testing before a deploy.                                                                                                                                              |
| `docker-compose.dev.yml`   | **Local only.** Bind-mounted source and hot reload on `localhost:3000`. Never read by the platform; never rename it to `docker-compose.override.yml`.                                                                                   |
| `.dockerignore`            | Keeps secrets, runtime data, and build output out of the build context.                                                                                                                                                                 |

## Data

Everything the café edits lives in the named volume `kapucinus_data` (`/app/data`):

- `kapucinus.db` — SQLite (WAL mode): content, settings, admin sessions.
- `media/` — every uploaded image, encoded as AVIF + WebP.

On the very first start the volume is empty; the app creates the schema and loads the café's
own photographs and starting content. Later deploys keep the volume, so nothing the café entered
is lost. **Back it up** (e.g. nightly):

```bash
docker run --rm -v kapucinus_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/kapucinus-data-$(date +%F).tar.gz -C /data .
```

## Environment (set in the panel: Sites → site → Environment)

| Variable              | Required | Notes                                                                                                                                      |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SITE_URL`            | yes      | Public URL, e.g. `https://www.example.hu`. Used for canonical URLs, sitemap, Open Graph. Read at runtime.                                  |
| `ADMIN_USERNAME`      | yes      | Admin login name.                                                                                                                          |
| `ADMIN_PASSWORD_HASH` | yes      | Generate locally: `npm run admin:hash` (the password is read from stdin, never echoed). A plain `ADMIN_PASSWORD` is refused in production. |
| `SESSION_SECRET`      | yes      | ≥ 32 random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`                                   |
| `MAX_UPLOAD_MB`       | no       | Largest admin upload, default 12.                                                                                                          |

Secrets are never baked into the image; the panel writes `.env`, which the compose loads.

## Deploy steps

1. Create the client/site in the panel with the slug **`kapucinus`** (template _None_ for a repo
   deploy). If the slug differs, edit the container and network names in `docker-compose.yml`
   (or `cef generate deploy --client-slug <slug>`).
2. Container port **80** (the platform default).
3. Set the environment variables above.
4. Point the client at the repository and branch, then **Deploy now** (or push to auto-deploy).
5. The platform validates the compose, builds the image, starts `hosting_kapucinus_web`, and
   Traefik routes the domain to it with a Let's Encrypt certificate.
6. Check `https://<domain>/api/health` → `{"status":"ok"}`, then log in at `/admin`.

## Before pushing: verify the production image locally

```bash
cp .env.example .env    # fill in the variables
docker compose -f docker-compose.local.yml up --build
# http://localhost:8080 and http://localhost:8080/admin
```

## Review previews

A review link is built from the first service's `build`, `image`, `environment`, `expose`, and
`command` only — without the volume. A preview therefore starts from the seed content on an
ephemeral disk; edits made in a preview's admin are not kept. The live container and its volume
are untouched.
