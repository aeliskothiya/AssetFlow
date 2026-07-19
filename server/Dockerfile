FROM node:20-alpine

WORKDIR /app

# Copy package files first to optimize Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
