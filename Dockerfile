FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

RUN npm install

# Copy application files
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
