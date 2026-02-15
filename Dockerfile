# --- Builder stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install devDependencies in the builder so Next.js can transpile next.config.ts
RUN npm ci
COPY . .
RUN npm run build
# Remove devDependencies before copying node_modules to the runtime image
RUN npm prune --production

# --- Runner stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
