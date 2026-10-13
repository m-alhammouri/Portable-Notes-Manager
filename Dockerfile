FROM node:24-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY artifacts/portable-notes-manager/package.json artifacts/portable-notes-manager/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
ENV BASE_PATH=/
ENV FRONTEND_DIST_DIR=/app/public

RUN pnpm --filter @workspace/portable-notes-manager run build \
    && pnpm --filter @workspace/api-server run build \
    && mkdir -p /app/public \
    && cp -R artifacts/portable-notes-manager/dist/public/. /app/public/

EXPOSE 5000

CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
