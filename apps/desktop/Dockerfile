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

# Copy the entire project for workspace setup
COPY . .

# Enable workspace feature and install dependencies
RUN npm install -g npm@latest && \
    npm install --no-audit --no-fund --workspaces=false

# Build dependencies in correct order
RUN cd packages/core && npm run build && \
    cd ../crdt && npm run build

# Set environment variables
ENV DISPLAY=:99
ENV ELECTRON_DISABLE_SANDBOX=1
ENV ELECTRON_NO_ATTACH_CONSOLE=1

# Create a script to run Xvfb and the app
RUN echo '#!/bin/bash' > /app/start.sh
RUN echo 'Xvfb :99 -screen 0 1024x768x16 &' >> /app/start.sh
RUN echo 'npm run dev --prefix apps/desktop' >> /app/start.sh
RUN chmod +x /app/start.sh

WORKDIR /app/apps/desktop

EXPOSE 3000

CMD ["/app/start.sh"] 