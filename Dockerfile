# syntax=docker/dockerfile:1
# Multi-stage build for the Kapucinus Kávézó site (Next.js standalone). The runtime listens on
# port 80 so the hosting platform's Traefik can route to it with no extra configuration.
#
#   deps     all dependencies (with a native toolchain as a fallback for better-sqlite3)
#   dev      local hot reload — used only by docker-compose.dev.yml
#   builder  `npm run build`: encodes the seed photographs and brand assets, then builds Next.js
#   runner   the production image: standalone server, static files, seed media; non-root
#
# "runner" stays last, so a bare `docker build` (and the platform) produces the production image.

ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# better-sqlite3 and sharp install prebuilt binaries; the compiler is only a fallback for a
# platform without one, and it never reaches the runtime image.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Local development only — targeted by docker-compose.dev.yml, never by the platform. Docker
# builds a stage only when the target depends on it, and "runner" does not depend on this one.
FROM ${NODE_IMAGE} AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80
ENV HOSTNAME=0.0.0.0
# The SQLite database and uploaded images. Mounted as a named volume by the compose files;
# the first boot seeds it from /app/.seed-media.
ENV DATA_DIR=/app/data
ENV SEED_MEDIA_DIR=/app/.seed-media

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/.seed-media ./.seed-media
RUN mkdir -p /app/data && chown node:node /app/data

# Unprivileged. Docker lets a non-root process bind port 80 inside the container
# (net.ipv4.ip_unprivileged_port_start=0 by default since Docker 20.10).
USER node
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 80) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
