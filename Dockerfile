ARG NODE_IMAGE=node:24.11.1-alpine3.22


# Builder
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY .npmrc package.json package-lock.json .
RUN npm ci

COPY . .
RUN node --run sync && \
    node --run build && \
    find build -name "*.map" -delete

# Runner
FROM ${NODE_IMAGE} AS runner
LABEL org.opencontainers.image.description="Flagflow engine"
LABEL org.opencontainers.image.vendor="Flagflow"
LABEL org.opencontainers.image.source="https://github.com/flagflow/flagflow/blob/main/Dockerfile"
LABEL org.opencontainers.image.url="https://flagflow.net"

RUN apk upgrade -U && apk add curl
WORKDIR /app

COPY .npmrc package.json package-lock.json .
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    find node_modules \( \
        -type d -empty \
        -o -iname "license*" \
        -o -name "*.md" \
        -o -name "*.txt" \
        -o -name "*.map" \
        -o -name ".git*" \
        -o -name "*.yml" \
        -o -name "*.yaml" \
        -o -name "*.json" -path "*/test/*" \
        -o -name "*.json" -path "*/tests/*" \
        -o -name "test" -type d \
        -o -name "tests" -type d \
        -o -name "__tests__" -type d \
        -o -name "coverage" -type d \
        -o -name ".nyc_output" -type d \
    \) -delete && \
    rm -rf /tmp/* /var/cache/apk/* /root/.npm

COPY --from=builder /app/build ./build
RUN find build -name "*.map" -delete

ENV NODE_ENV=production
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "build"]
