# Estágio 1: Build da API e Prisma Client
FROM node:20-alpine AS builder

# Instalar pacotes de compatibilidade do OpenSSL para Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# Estágio 2: Imagem leve de Produção
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3333

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
