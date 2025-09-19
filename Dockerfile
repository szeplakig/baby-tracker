FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci --verbose

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
COPY ./prisma /app/prisma
WORKDIR /app
RUN npm ci --omit=dev
RUN npx prisma generate --schema=./prisma/schema.prisma

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/db
COPY ./package.json package-lock.json /app/
COPY ./litestream.yml /app/
COPY ./dbsetup.js /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=production-dependencies-env /app/node_modules/@prisma-app /app/node_modules/@prisma-app
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/node_modules/.prisma /app/node_modules/.prisma
COPY ./prisma /app/prisma
WORKDIR /app
EXPOSE 3000
CMD ["node", "dbsetup.js", "npm", "run", "start", "--", "--port", "3000", "--hostname", "0.0.0.0"]
