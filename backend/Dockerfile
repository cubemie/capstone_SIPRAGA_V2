# ============================================================
# backend/Dockerfile
# Stage: production image untuk CORETAX backend (Express.js)
# ============================================================

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies lebih dulu (memanfaatkan Docker layer cache)
# Layer ini TIDAK di-rebuild selama package.json tidak berubah
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Port yang di-expose (harus sama dengan PORT di .env)
EXPOSE 3000

# Jalankan server
CMD ["node", "src/server.js"]
