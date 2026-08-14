# syntax=docker/dockerfile:1

FROM node:20-bookworm AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

RUN groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json

USER nextjs
CMD ["npm", "run", "start"]
