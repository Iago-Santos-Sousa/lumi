# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:18.13.0 AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y wget python3 make gcc g++ gnupg && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Debug: mostra o que foi gerado
RUN echo "=== Arquivos gerados em dist ===" && find dist -type f

# ── Stage 2: Produção ──────────────────────────────────────────────────────
FROM node:18.13.0 AS production
WORKDIR /app

# Instala Chrome e dependências
RUN apt-get update && apt-get install -y wget gnupg && \
    wget --quiet -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -rm -g app -G audio,video app

# Instala APENAS dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia SOMENTE o dist compilado (não o node_modules de dev)
COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads/invoices && chown -R app:app /app

ENV NODE_ENV=production

EXPOSE 3001

USER app

# CMD explícito — não depende do package.json
CMD ["node", "dist/main.js"]