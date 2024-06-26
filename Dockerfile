### BUILD ###

FROM docker.io/library/node:20-alpine@sha256:ef3f47741e161900ddd07addcaca7e76534a9205e4cd73b2ed091ba339004a75 as with-git

WORKDIR /app

# install git
RUN apk --no-cache add git

# Copy the node config files
COPY --chown=node:node ./package*.json ./

# Load only direct dependencies for Production use
RUN npm ci --omit=dev --omit=peer && \
    # Clean up npm cache
    npm cache clean --force && \
    # Remove @types
    rm -fr node_modules/@types && \
    # Remove Ramda unused Ramda files
    rm -fr node_modules/ramda/dist && \
    rm -fr node_modules/ramda/es && \
    # Remove all typescript files
    find . -name "*.ts" -type f -delete

# Sync the pepr dist files
COPY --chown=node:node ./dist/  ./node_modules/pepr/dist/
COPY --chown=node:node ./package.json  ./node_modules/pepr/package.json

##### DELIVER #####

FROM cgr.dev/chainguard/node-lts@sha256:4c0a73a75b21e0e9544cdfe6a2fdbefb14b5c053f52b31700355b8450c043da0

WORKDIR /app

COPY --from=with-git --chown=node:node /app/ /app/
