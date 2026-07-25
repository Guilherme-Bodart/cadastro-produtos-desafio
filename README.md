# Sistema de Cadastro de Produtos (CRUD Full Stack)

Solução completa desenvolvida para o teste técnico de gerenciamento e catálogo de produtos. O projeto é composto por **Backend (Node.js + Prisma + PostgreSQL)**, **Frontend Web (Next.js 14 + Tailwind CSS)** e **Frontend Mobile (Expo / React Native)** com design system unificado.

---

## Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon DB), BcryptJS, JWT, Multer.
- **Frontend Web:** Next.js 14 (App Router), React, Tailwind CSS, Lucide React, Axios.
- **Frontend Mobile:** React Native, Expo (Expo Router v3), React Native Paper, Axios, TypeScript.

---

## Estrutura do Repositório

```text
cadastro-produtos/
├── backend/          # API REST Node.js + Express + Prisma ORM + Docker
├── web/              # Aplicação Frontend Web (Next.js 14 com Tailwind CSS)
└── mobile/           # Aplicação Frontend Mobile (Expo Router + React Native Paper)
```

---

## 1. Como Executar o Backend (`/backend`)

Você pode rodar o backend de duas formas: **Localmente** ou via **Docker**.

### 🔹 Opção A: Rodar Localmente (Node.js)

1. Acesse o diretório do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz da pasta `backend` com as variáveis:

   ```env
   DATABASE_URL="postgresql://usuario:senha@ep-exemplo.neon.tech/neondb?sslmode=require"
   PORT=3333
   JWT_SECRET="seu_secreto_super_seguro"
   ```

4. Aplique a estrutura das tabelas no banco de dados:

   ```bash
   npx prisma db push
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   - A API estará rodando em: `http://localhost:3333`
   - Rota de teste/saúde da API: `http://localhost:3333/health`

---

### 🔹 Opção B: Rodar com Docker

1. Acesse o diretório do backend:

   ```bash
   cd backend
   ```

2. Construa a imagem Docker:

   ```bash
   docker build -t backend-produtos .
   ```

3. Execute o container informando as variáveis de ambiente:
   ```bash
   docker run -p 3333:3333 \
     -e DATABASE_URL="postgresql://usuario:senha@ep-exemplo.neon.tech/neondb?sslmode=require" \
     -e JWT_SECRET="seu_secreto_super_seguro" \
     backend-produtos
   ```

---

## 💻 2. Como Executar o Frontend Web (`/web`)

1. Acesse a pasta do projeto Web:

   ```bash
   cd web
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env.local` na pasta `web`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3333
   ```

4. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra o navegador e acesse: `http://localhost:3000`

---

## 📱 3. Como Executar o Frontend Mobile (`/mobile`)

O projeto mobile foi construído com **Expo Router**. Você pode testá-lo diretamente no navegador ou no seu smartphone físico.

### 🔹 Opção A: Rodar no Navegador (Expo Web)

1. Acesse a pasta do mobile:

   ```bash
   cd mobile
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie a aplicação no modo Web:

   ```bash
   npm run web
   ```

   - O navegador abrirá automaticamente em `http://localhost:8081`.

---

### 🔹 Opção B: Rodar no Celular Físico (Expo Go)

1. Instale o aplicativo **Expo Go** no seu smartphone:
   - [Expo Go para Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Expo Go para iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

2. Crie ou ajuste o arquivo `.env` na pasta `mobile` apontando a API para o seu **IP local na rede Wi-Fi**:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.X:3333
   ```

   _(Substitua `192.168.1.X` pelo IP do seu computador na rede local)._

3. No computador, inicie o Expo:

   ```bash
   npx expo start
   ```

4. **Como conectar:**
   - **Android:** Abra o app Expo Go no celular e escaneie o **QR Code** exibido no terminal do computador.
   - **iOS:** Abra a câmera padrão do iPhone, escaneie o QR Code e toque no link para abrir no Expo Go.

---

### 🔹 Opção C: Gerar o arquivo APK para Android

Se quiser gerar um instalador standalone (`.apk`) para Android sem depender do Expo Go:

1. Certifique-se de ter a CLI do EAS instalada:

   ```bash
   npm install -g eas-cli
   ```

2. Execute o comando de build de preview:
   ```bash
   npm run build
   # Ou: eas build -p android --profile preview
   ```

---

## Recursos & Diferenciais Implementados

1. **Busca com Debounce:** Delay otimizado de 400ms no campo de pesquisa mobile para evitar sobrecarga de requisições.
2. **Autenticação JWT & Criptografia:** Criptografia Bcrypt para senhas e tokens JWT armazenados com segurança.
3. **Banco PostgreSQL em Nuvem:** Conexão em nuvem via Neon DB com migrações automáticas.
