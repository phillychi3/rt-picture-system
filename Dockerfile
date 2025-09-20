FROM node:18-alpine

WORKDIR /app


COPY package*.json ./
COPY pnpm-lock.yaml ./


RUN npm install -g pnpm


RUN pnpm install --frozen-lockfile


COPY . .


RUN pnpm run build


ENV NODE_ENV=production


EXPOSE 3000

# 啟動應用程式
CMD ["node", "build/index.js"]