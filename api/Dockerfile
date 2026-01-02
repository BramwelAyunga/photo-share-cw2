# ---- Base Stage ----
FROM node:18-slim AS base
WORKDIR /usr/src/app



# ---- Dependencies Stage ----
FROM base AS dependencies
COPY package*.json ./
RUN npm install --production

# ---- Development Stage ----
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# ---- Production Stage ----
FROM base AS production
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
