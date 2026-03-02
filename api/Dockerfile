# Fase 1: Construção
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Fase 2: Imagem de produção (somente o necessário)
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

RUN mkdir -p uploads/invoices

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
