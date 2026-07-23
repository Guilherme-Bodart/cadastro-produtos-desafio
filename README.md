# Sistema de Cadastro de Produtos (CRUD)

Este repositório contém a solução completa para o teste técnico de desenvolvimento, dividida em três aplicações independentes e bem estruturadas:

## 📁 Estrutura de Pastas

```text
cadastro-produtos/
├── backend/          # API Node.js + TypeScript + Prisma ORM + Express + SQLite
│   ├── prisma/       # Schema do banco de dados (Product & User)
│   ├── src/
│   │   ├── config/       # Configurações gerais e uploads
│   │   ├── controllers/  # Controladores das rotas
│   │   ├── middlewares/  # Middlewares de validação e auth
│   │   ├── routes/       # Definição das rotas da API
│   │   └── services/     # Regras e comunicação com Prisma
│   └── uploads/      # Armazenamento das imagens dos produtos
│
├── web/              # Aplicação Frontend Web (Next.js 14+ com App Router & Tailwind CSS)
│   ├── src/
│   │   ├── app/          # Páginas e roteamento Next.js
│   │   ├── components/   # Componentes reutilizáveis (Tabelas, Formulários, Cards)
│   │   └── services/     # Integração Axios com o backend
│
└── mobile/           # Aplicação Frontend Mobile (Expo / React Native com TypeScript)
    ├── src/
    │   ├── components/   # Componentes da interface mobile
    │   ├── screens/      # Telas (Listagem, Cadastro, Detalhes)
    │   ├── services/     # Integração com backend
    │   └── types/        # Tipagens TypeScript do produto
    └── App.tsx           # Ponto de entrada do app Expo
```

---

## 🚀 Como Executar

### 1. Backend (`/backend`)
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
- API disponível em: `http://localhost:3333`
- Rota de verificação: `http://localhost:3333/health`

### 2. Web (`/web`)
```bash
cd web
npm install
npm run dev
```
- Aplicação rodando em: `http://localhost:3000`

### 3. Mobile (`/mobile`)
```bash
cd mobile
npm install
npx expo start
```
- Escaneie o QR Code via Expo Go no celular ou rode em um emulador.
