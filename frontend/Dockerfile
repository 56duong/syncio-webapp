# FROM node:20-alpine3.17 AS builder

# WORKDIR /app

# COPY ./frontend/package.json package.json
# RUN npm install

# COPY ./frontend/ .

# RUN npm run build

# FROM nginx:alpine

# COPY --from=builder /app/dist/frontend /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


FROM node:20-alpine3.17 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# Stage 2: Serve the Angular app using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

#docker build -t chuthanh/dockerfile-fronted:latest -f Dockerfile .
#docker push chuthanh/dockerfile-fronted:latest