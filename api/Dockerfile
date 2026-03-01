# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Verifica se o build gerou o main.js (vai falhar o build se não gerou)
RUN test -f dist/main.js || (echo "❌ dist/main.js não encontrado após build!" && exit 1)

# ── Stage 2: Produção ──────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código compilado do estágio de build
COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads/invoices

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main.js"]