FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY ../../package.json ../../package-lock.json ./

# Copy scripts
COPY ../../scripts scripts

# Copy all package.json files first
COPY ../../packages/core/package.json packages/core/package.json
COPY ../../packages/crdt/package.json packages/crdt/package.json
COPY ../../apps/server/package.json apps/server/package.json

# Install dependencies and additional required packages
RUN npm install && \
    npm install -g typescript tsup && \
    npm install @langchain/langgraph @types/node tsconfig-paths

# Copy source files and configs
COPY ../../packages/core packages/core
COPY ../../packages/crdt packages/crdt
COPY ../../apps/server apps/server
COPY ../../tsconfig.base.json ./
COPY ../../apps/server/tsconfig.json apps/server/tsconfig.json

# Build packages with strict mode disabled for now
RUN cd packages/core && npm run build && cd ../.. && \
    cd packages/crdt && npm run build && cd ../.. && \
    cd apps/server && npm run build && cd ../..

# Copy template files to dist
RUN cp -r apps/server/src/templates apps/server/dist/

# Cleanup dev dependencies
RUN npm prune --production

# Default environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DEBUG=colanode:*

EXPOSE ${PORT}

# Use node with CommonJS for better compatibility
CMD ["node", "--require", "tsconfig-paths/register", "apps/server/dist/index.js"]