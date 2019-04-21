FROM node:alpine as builder
WORKDIR /app
ARG PROXY
ARG ENV
ARG PORT

COPY package.json .
RUN npm install
COPY . .

RUN rm .env
RUN echo -e "NODE_ENV=$ENV \nPORT=$PORT \nPROXY=$PROXY" >> .env

RUN npm run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html