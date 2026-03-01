# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# VITE_API_BASE_URL é substituído em tempo de build pelo Vite
# O valor padrão aponta para o endereço público da API (localhost no host)
ARG VITE_API_BASE_URL=http://localhost:3001/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copia os manifestos de dependências primeiro para aproveitar cache do Docker
COPY package*.json ./
RUN npm ci

# Copia todo o código-fonte e gera o bundle de produção
COPY . .
RUN npm run build

# ── Stage 2: Servir com Nginx ──────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copia o bundle gerado pelo Vite para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx (suporte a SPA / React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
