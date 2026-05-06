# syntax=docker/dockerfile:1

# ============================================
# Stage 1: builder
# ============================================
FROM node:20-alpine AS builder

ARG APP_NAME
WORKDIR /app

RUN corepack enable

# Сначала только манифесты — для кэширования слоя зависимостей.
# Если код меняется, но package.json — нет, этот слой остаётся кэшированным.
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

# Теперь копируем весь исходник
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

# Собираем конкретное приложение из монорепо
RUN pnpm build ${APP_NAME}


# ============================================
# Stage 2: runner
# ============================================
FROM node:20-alpine AS runner

ARG APP_NAME
ENV NODE_ENV=production
ENV APP_NAME=${APP_NAME}

WORKDIR /app

RUN corepack enable

# Только production-зависимости
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Копируем собранный код из builder-stage
COPY --from=builder /app/dist ./dist

# Не запускаем как root — security best practice
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs
USER nestjs

# Healthcheck без curl/wget — через node http
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Используем sh -c для подстановки переменной окружения
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]