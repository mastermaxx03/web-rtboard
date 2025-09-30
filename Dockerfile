# Stage 1: Build
FROM node:22.19.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22.19.0
WORKDIR /app
COPY --from=builder /app/dist ./build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve","-s", "build", "-l", "3000"]
