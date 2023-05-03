# FROM node:latest AS Production

# ENV NODE_ENV=production

# WORKDIR /app

# EXPOSE 3000

# # ENTRYPOINT ["/bin/sh", "-c", "npm install && npx prisma migrate dev && npm run build && npx prisma migrate deploy && npm start"]
# # CMD ["/bin/sh", "-c", "npm start && sleep 2 && npx prisma migrate deploy"]
# CMD ["/bin/sh", "-c", "npm run start:debug ; npx prisma migrate deploy"]

FROM node:latest AS development

ENV NODE_ENV=development

WORKDIR /app

EXPOSE 3000

# use this if you want to run the app in debug mode
# CMD ["/bin/sh", "-c", "npm run start:debug ; npx prisma migrate deploy"]
# use this if you want to run the app in production mode
CMD ["/bin/sh", "-c", "npx prisma db push && npm run start:debug ; npx prisma migrate deploy"]