# Lumi — Plataforma de Gestão de Faturas de Energia

Aplicação full-stack para gerenciamento de faturas de energia elétrica (CEMIG).  
Composta por uma API REST em **NestJS** e uma interface web em **React + Vite**.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Pré-requisitos](#pré-requisitos)
4. [Executando com Docker (recomendado)](#executando-com-docker-recomendado)
5. [Criando o primeiro usuário](#criando-o-primeiro-usuário)
6. [Executando manualmente (sem Docker)](#executando-manualmente-sem-docker)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Documentação da API (Swagger)](#documentação-da-api-swagger)
9. [Estrutura do Projeto](#estrutura-do-projeto)

---

## Visão Geral

| Serviço    | URL local                 | Descrição                         |
| ---------- | ------------------------- | --------------------------------- |
| Front-end  | http://localhost:3000     | Interface React                   |
| API        | http://localhost:3001/api | API REST NestJS                   |
| Swagger    | http://localhost:3001/api | Documentação interativa           |
| PostgreSQL | interno (rede Docker)     | Acessível apenas pelos containers |

---

## Tecnologias

**Back-end**

- Node.js 20 · NestJS 11 · TypeORM 0.3 · PostgreSQL 16
- Autenticação JWT (access token + refresh token)
- Swagger/OpenAPI para documentação

**Front-end**

- React 18 · Vite 5 · TypeScript
- Material UI 7 · TailwindCSS 3
- TanStack Query 5 · React Hook Form 7

---

## Pré-requisitos

### Para execução via Docker

| Ferramenta     | Versão mínima | Download                            |
| -------------- | ------------- | ----------------------------------- |
| Docker         | 24+           | https://docs.docker.com/get-docker/ |
| Docker Compose | 2.20+         | Já incluso no Docker Desktop        |

> **Windows / macOS**: instalar o **Docker Desktop** já inclui tudo que é necessário.

### Para execução manual

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| Node.js    | 20+           |
| npm        | 10+           |
| PostgreSQL | 16+           |

---

## Executando com Docker (recomendado)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd lumi
```

### 2. Suba todos os serviços

```bash
docker compose up --build
```

> Na **primeira execução**, o Docker irá:
>
> 1. Baixar as imagens base (Node 20, Nginx, PostgreSQL 16)
> 2. Instalar as dependências e compilar os projetos
> 3. Criar o banco de dados **lumis** automaticamente
> 4. O TypeORM criará todas as tabelas no banco via `synchronize: true`
>
> Aguarde até ver a mensagem `Server running on port: 3001` no terminal.

### 3. Acesse a aplicação

- **Front-end:** http://localhost:3000
- **API / Swagger:** http://localhost:3001/api

### Parar os serviços

```bash
docker compose down
```

Para parar **e remover os volumes** (apaga o banco de dados e uploads):

```bash
docker compose down -v
```

### Reconstruir após alterações no código

```bash
docker compose up --build
```

---

## Criando o primeiro usuário

O endpoint de criação de usuário é **público** (não requer autenticação).  
Após subir a aplicação, crie o primeiro usuário administrador com uma das opções abaixo.

### Opção A — Pelo Swagger (interface visual)

1. Acesse http://localhost:3001/api
2. Expanda a seção **User**
3. Clique em `POST /api/user`
4. Clique em **Try it out** e envie o seguinte corpo:

```json
{
  "name": "Admin",
  "email": "admin@lumi.com",
  "password": "123456",
  "role": "admin"
}
```

### Opção B — Pelo terminal (curl)

```bash
curl -X POST http://localhost:3001/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@lumi.com",
    "password": "123456",
    "role": "admin"
  }'
```

### Opção C — Pelo front-end

1. Acesse http://localhost:3000
2. Clique em **Criar conta** (ou navegue para `/criar-usuario`)
3. Preencha o formulário com os dados desejados

> **Roles disponíveis:** `admin` | `user`  
> O role `admin` possui acesso completo a todas as funcionalidades.

---

## Executando manualmente (sem Docker)

### Pré-requisitos

Certifique-se de ter o PostgreSQL rodando localmente com um banco chamado `lumis`.  
Você pode criar o banco via `psql`:

```sql
CREATE DATABASE lumis;
```

---

### Back-end (API NestJS)

```bash
cd api
```

**1. Instale as dependências**

```bash
npm install
```

**2. Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

**3. Inicie em modo de desenvolvimento**

```bash
npm run start:dev
```

A API estará disponível em http://localhost:3001  
O Swagger estará disponível em http://localhost:3001/api

> As tabelas são criadas automaticamente pelo TypeORM (`DB_SYNCHRONIZE=true`).

---

### Front-end (React + Vite)

```bash
cd front-end
```

**1. Instale as dependências**

```bash
npm install
```

**2. Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

O arquivo `.env` padrão já aponta para `http://localhost:3001/api`.

**3. Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

O front-end estará disponível em http://localhost:5173

---

## Variáveis de Ambiente

### API (`api/.env`)

| Variável              | Padrão      | Descrição                                       |
| --------------------- | ----------- | ----------------------------------------------- |
| `APP_PORT`            | `3001`      | Porta em que a API será exposta                 |
| `DB_HOST`             | `localhost` | Host do PostgreSQL (`db` no Docker)             |
| `DB_PORT`             | `5432`      | Porta do PostgreSQL                             |
| `DB_USER`             | `postgres`  | Usuário do banco                                |
| `DB_PASSWORD`         | —           | Senha do banco                                  |
| `DB_SCHEMA`           | `lumis`     | Nome do banco de dados                          |
| `DB_SYNCHRONIZE`      | `true`      | Cria/atualiza tabelas automaticamente (TypeORM) |
| `DB_CONNECTION_LIMIT` | `10`        | Tamanho máximo do pool de conexões              |
| `JWT_SECRET`          | —           | Segredo para assinar os access tokens           |
| `JWT_REFRESH_SECRET`  | —           | Segredo para assinar os refresh tokens          |
| `JWT_EXPIRES`         | `30m`       | Expiração do access token                       |
| `JWT_REFRESH_EXPIRES` | `45m`       | Expiração do refresh token                      |

> ⚠️ `DB_SYNCHRONIZE=true` é conveniente em desenvolvimento/avaliação.  
> Em produção real, prefira usar migrations.

### Front-end (`front-end/.env`)

| Variável             | Padrão                      | Descrição                          |
| -------------------- | --------------------------- | ---------------------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:3001/api` | URL base da API consumida pelo app |
| `VITE_APP_FRONT_URL` | `http://localhost:3000`     | URL pública do front-end           |

---

## Documentação da API (Swagger)

Após subir qualquer um dos ambientes, a documentação completa e interativa da API estará disponível em:

**http://localhost:3001/api**

A documentação cobre todos os módulos:

| Módulo    | Descrição                                                       |
| --------- | --------------------------------------------------------------- |
| `Auth`    | Login, logout e renovação de token (refresh)                    |
| `User`    | Criação, listagem, atualização e remoção de usuários            |
| `Client`  | Listagem paginada de clientes e busca por ID                    |
| `Invoice` | Dashboard com totais e gráficos de consumo de energia           |
| `Upload`  | Upload de PDFs de fatura CEMIG e download de arquivo por fatura |

### Autenticação no Swagger

1. Faça login via `POST /api/auth/login` no Swagger
2. Copie o `access_token` da resposta
3. Clique no botão **Authorize 🔒** no topo da página
4. Cole o token no campo e confirme
5. Todas as requisições subsequentes incluirão o Bearer token

---

## Estrutura do Projeto

```
lumi/
├── api/                        # Back-end NestJS
│   ├── src/
│   │   ├── auth/               # Autenticação JWT
│   │   ├── user/               # Módulo de usuários
│   │   ├── client/             # Módulo de clientes CEMIG
│   │   ├── invoice/            # Módulo de faturas e dashboard
│   │   ├── upload/             # Upload e download de PDFs
│   │   └── common/             # DTOs, decorators e utilitários compartilhados
│   ├── uploads/invoices/       # PDFs armazenados (volume Docker)
│   ├── Dockerfile
│   ├── tsconfig.production.json
│   └── .env
│
├── front-end/                  # Front-end React + Vite
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── integrations/       # Clientes HTTP (axios)
│   │   ├── hooks/              # React Query hooks
│   │   └── context/            # Contextos globais
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env
│
└── docker-compose.yml          # Orquestração dos 3 serviços
```

---

## Fluxo de Upload de Faturas

1. Acesse o front-end e faça login
2. Navegue até **Biblioteca de Faturas**
3. Arraste ou selecione os arquivos PDF (faturas CEMIG, até 5 por vez)
4. A API extrai os dados automaticamente (número do cliente, consumo, valores, etc.)
5. Os dados são persistidos no banco e os PDFs salvos em `uploads/invoices/`
6. Acesse o **Dashboard** para visualizar os gráficos de consumo e economia

---

## Solução de Problemas

### `docker compose up` falha na conexão com o banco

A API aguarda o PostgreSQL ficar saudável antes de iniciar (via `healthcheck`).  
O PostgreSQL **não exposta a porta 5432 ao host**, portanto não há conflito com uma instância local já em execução.

Se a API ainda falhar, verifique os logs:

```bash
docker compose logs api
```

### Erro de permissão no diretório uploads

```bash
docker compose exec api mkdir -p uploads/invoices
```

### Recriar os containers do zero

```bash
docker compose down -v
docker compose up --build
```
