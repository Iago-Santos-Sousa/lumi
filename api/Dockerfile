# Fase 1: Construção da aplicação
FROM node:18.13.0 as build

WORKDIR /app

# Instalação das dependências necessárias para a construção
RUN apt-get update && apt-get install -y wget python make gcc g++ gnupg

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Fase 2: Imagem final para produção
FROM node:18.13.0 as production

WORKDIR /app

# Instalação das dependências necessárias para a execução, incluindo o Google Chrome
RUN apt-get update && apt-get install -y wget gnupg && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -rm -g app -G audio,video app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app /app

RUN mkdir -p uploads/invoices

EXPOSE 3001

USER app

CMD ["npm", "run", "start:prod"]
