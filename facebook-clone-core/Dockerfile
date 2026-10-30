# Stage 1: Builder
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG BUILD_REVISION=dev
RUN echo "build revision: ${BUILD_REVISION}" \
    && npm run build \
    && ! grep -q "credential.cert" dist/app.module.js \
    && echo "OK: dist/app.module.js không còn Firebase"

# Stage 2: Dev (ts-node-dev)
FROM node:22-slim AS dev
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3301
CMD ["npm", "run", "start:dev"]

# Stage 3: Runtime (production)
FROM node:22-slim AS runtime
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3301
ENTRYPOINT ["/docker-entrypoint.sh"]