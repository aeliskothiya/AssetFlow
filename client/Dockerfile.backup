# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
# We use npm ci for a clean, deterministic install
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the React application
# Accepts VITE_API_BASE_URL as a build argument
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage
# Using a lightweight alpine node image with 'serve' to serve static files
FROM node:20-alpine

WORKDIR /app

# Install 'serve' globally to serve the built assets
RUN npm install -g serve

# Copy only the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the frontend port
EXPOSE 5173

# Serve the application on the required port, supporting single-page app routing
CMD ["serve", "-s", "dist", "-l", "5173"]
