FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

ENV NEXT_PUBLIC_DEMO_MODE=true
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production PORT=3000

CMD ["sh", "-c", "npx prisma migrate deploy && (npm run seed:demo || echo 'seed skipped') && npm start"]
