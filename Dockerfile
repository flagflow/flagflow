ARG NODE_IMAGE=node:24.5.0-alpine3.22


# Builder
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY .npmrc package.json package-lock.json .
RUN npm ci
COPY . .
RUN node --run sync && node --run build


# Runner
FROM ${NODE_IMAGE} AS runner
LABEL org.opencontainers.image.description="Flagflow engine"
LABEL org.opencontainers.image.vendor="Flagflow"
LABEL org.opencontainers.image.source="https://github.com/flagflow/flagflow/blob/main/Dockerfile"
LABEL org.opencontainers.image.url="https://flagflow.net"
RUN apk add --no-cache curl
WORKDIR /app

COPY package.json package-lock.json .
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    find node_modules -type d -empty -delete && \
    find node_modules -name "license" -delete && \
    find node_modules -name "LICENSE" -delete && \
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.txt" -delete && \
    find node_modules -name "*.map" -delete && \
    find node_modules -name ".git*" -delete

COPY --from=builder /app/build ./build
RUN find build -name "*.map" -delete

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build"]
