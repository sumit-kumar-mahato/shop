FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for compilation / prisma
RUN apk add --no-cache openssl

COPY package.json tsconfig.json ./
COPY prisma ./prisma/

# Install npm dependencies
RUN npm install

# Copy other source code files
COPY src ./src/
COPY tailwind.config.js postcss.config.js next.config.js ./

EXPOSE 3000

# Push DB schema, seed fashion data, and start dev server
CMD npx prisma db push && npx prisma db seed && npm run dev
