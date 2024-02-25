FROM node:20.11.0-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV ENV=$ENV

ENV PORT=$PORT

EXPOSE $PORT

CMD ["npm", "run", "start"]