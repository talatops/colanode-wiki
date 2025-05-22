FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    libx11-dev \
    libxkbfile-dev \
    libsecret-1-dev \
    xvfb \
    xorg \
    libnss3-dev \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/crdt/package*.json ./packages/crdt/
COPY apps/desktop/package*.json ./apps/desktop/

# Install dependencies with specific flags for faster installation
RUN npm install --no-audit --no-fund --ignore-scripts && \
    npm install --prefix packages/core --no-audit --no-fund && \
    npm install --prefix packages/crdt --no-audit --no-fund && \
    npm install --prefix apps/desktop --no-audit --no-fund

# Copy source files and configs
COPY packages/core packages/core
COPY packages/crdt packages/crdt
COPY apps/desktop apps/desktop
COPY tsconfig.base.json ./

# Build dependencies
RUN cd packages/core && npm run build && cd ../.. && \
    cd packages/crdt && npm run build && cd ../..

# Set environment variables
ENV DISPLAY=:99
ENV ELECTRON_DISABLE_SANDBOX=1
ENV ELECTRON_NO_ATTACH_CONSOLE=1

# Create a script to run Xvfb and the app
RUN echo '#!/bin/sh\nXvfb :99 -screen 0 1024x768x16 & npm run dev --prefix apps/desktop' > /app/start.sh && \
    chmod +x /app/start.sh

WORKDIR /app/apps/desktop

EXPOSE 3000

CMD ["/app/start.sh"] 