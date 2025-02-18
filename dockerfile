# ---- Build Stage ----
FROM node:22 AS build

WORKDIR /quiz-management
ENV NODE_ENV=production
    
COPY package.json package-lock.json ./
RUN npm install
    
# ---- Run Stage ----
FROM node:22
    
WORKDIR /quiz-management
COPY --from=build /quiz-management/node_modules ./node_modules
COPY . .
    
ENV PORT=5001
ENV LOG_PATH=/quiz-management/logs
EXPOSE 5001

LABEL maintainer="Salam Plinth <2023tm93762@wilp.bits-pilani.ac.in>"
LABEL org.opencontainers.image.authors="Salam Plinth <2023tm93762@wilp.bits-pilani.ac.in>"

CMD ["npm", "start"]

    