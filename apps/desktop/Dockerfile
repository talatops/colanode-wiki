FROM node:20-alpine

# Install system dependencies required for Electron
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libx11-dev \
    libxkbfile-dev \
    libsecret-dev \
    xorg-server \
    xvfb

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./

# Copy all package.json files first for better caching
COPY packages/core/package.json packages/core/package.json
COPY packages/crdt/package.json packages/crdt/package.json
COPY apps/desktop/package.json apps/desktop/package.json

# Install dependencies
RUN npm install

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

# Create a script to run Xvfb and the app
RUN echo '#!/bin/sh\nXvfb :99 -screen 0 1024x768x16 & npm run dev --prefix apps/desktop' > /app/start.sh && \
    chmod +x /app/start.sh

WORKDIR /app/apps/desktop

EXPOSE 3000

CMD ["/app/start.sh"] 