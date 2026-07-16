# Family Navigator — single-process production image.
# The database and document blobs live in DATA_DIR; MOUNT A PERSISTENT VOLUME
# at /data or every deploy erases every family's record. See docs/OPERATIONS.md.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/docs ./docs

EXPOSE 8787
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8787/healthz || exit 1
CMD ["npx", "tsx", "server/index.ts"]
