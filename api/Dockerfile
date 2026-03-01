# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os manifestos de dependências primeiro para aproveitar cache do Docker
COPY package*.json ./
RUN npm ci

RUN npm install

# Copia todo o código-fonte e compila o TypeScript
COPY . .
RUN npm run build

# ── Stage 2: Produção ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Instala apenas as dependências de produção
# + tsconfig-paths que é necessário em runtime para resolver aliases (src/*)
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsconfig-paths

# Copia o código compilado do estágio de build
COPY --from=builder /app/dist ./dist

# Copia o tsconfig de produção que mapeia src/* → dist/*
# (substitui o tsconfig.json padrão para que tsconfig-paths resolva corretamente)
COPY --from=builder /app/tsconfig.production.json ./tsconfig.json

# Cria o diretório de uploads (persistido via volume no docker-compose)
RUN mkdir -p uploads/invoices

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js","npm", "run", "start:prod"]
