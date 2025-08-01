ARG NODE_IMAGE=node:24.4.1-alpine3.22


# Builder
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN node --run sync && node --run build


# Runner
FROM ${NODE_IMAGE} AS runner
#RUN apk add --no-cache curl
WORKDIR /app

COPY package.json package-lock.json .
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["node", "build"]
