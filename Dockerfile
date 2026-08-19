FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci
COPY client ./client
RUN npm run build -w client

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DATABASE_PATH=/app/data/directory.db
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci --omit=dev -w server && npm cache clean --force
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "server"]
