# FROM node:latest AS Production

# ENV NODE_ENV=production

# WORKDIR /app

# EXPOSE 3333

# CMD ["/bin/sh", "-c", "npm install && npm start"]

FROM node:latest AS development

ENV NODE_ENV=development

WORKDIR /app

EXPOSE 3333

CMD ["/bin/sh", "-c", "npm install && npm run dev"]