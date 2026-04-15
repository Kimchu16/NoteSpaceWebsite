# Stage 1: Build the app
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install all dependencies (including devDependencies required for building)
RUN npm install
COPY . .
# Build the SvelteKit app (this generates the build/ folder because of adapter-node)
RUN npm run build

# Stage 2: Setup production environment
FROM node:22-alpine AS runner

WORKDIR /app
# Copy the package files to install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/build build/

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port adapter-node runs on
EXPOSE 3000

# Start the node server
CMD ["node", "build/index.js"]
