# ⭐ User Login System

📝 Este projeto é um sistema de login de usuário construído utilizando uma API Restful no back-end e uma interface de usuário no front-end. O back-end foi desenvolvido em Node.js com Express e MySQL, enquanto o front-end foi implementado em React.js com TypeScript.

## 🚀 Tecnologias Utilizadas:

- **Back-end:**
  - Node.js
  - Express
  - MySQL
  - Bcrypt (para encriptação de senhas)
  - JSON Web Token (JWT) para autenticação
  - Padrão MVC (Model-View-Controller)

- **Front-end:**
  - React.js
  - TypeScript
  - Tailwind CSS (Estilização CSS)
  - Axios (para realizar requisições à API)

## 💻 Funcionalidades:

- **Registro de Usuário:** Os usuários podem criar contas, com senhas encriptadas utilizando Bcrypt.
- **Login de Usuário:** Autenticação de usuários utilizando JWT, gerando access tokens e refresh tokens para se manterem logados.
- **Proteção de Rotas:** As rotas que requerem autenticação estão protegidas, garantindo que apenas usuários autenticados possam acessá-las.
- **Requisições Assíncronas:** O front-end utiliza Axios para interagir com a API de forma síncrona ou assíncrona, proporcionando uma experiência de usuário fluida.

## 📂 Estrutura do Projeto:

### Back-end

A estrutura do back-end segue o padrão MVC.

## 📌 Links:
- No momento ainda não foi feito o deploy.

## ▶️ Como Executar o Projeto:

### Back-end

1. Clone o repositório:
   git clone https://github.com/usuario/repo.git
   cd repo/back-end
2. Instale as dependências:
   npm install
3. Configure o banco de dados MySQL e ajuste as credenciais no arquivo de configuração.
4. Execute a API:
   npm start (ou o script de comando que quiser)

### Front-end
1. Em um novo terminal, navegue até a pasta do front-end:
   git clone https://github.com/usuario/repo.git
   cd repo/back-end
2. Instale as dependências:
   npm install
3. Execute a aplicação:
   npm run dev

## 💡 Futuras Implementações:
- Login com Google: Planejamos integrar a autenticação via Google para proporcionar uma experiência de login ainda mais conveniente para os usuários.

## 📊 Status do projeto:
- Em andamento
