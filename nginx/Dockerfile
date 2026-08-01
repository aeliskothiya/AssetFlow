# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Production Nginx
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
