FROM node:20-alpine

WORKDIR /usr/src/app
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    ffmpeg
COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "app/app.js"]