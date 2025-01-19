FROM node:lts-alpine

RUN apk add --no-cache git ffmpeg && \
    git clone https://github.com/Ainz-fk/OVL-MD.git /ovl_bot

WORKDIR /ovl_bot

COPY package.json .

RUN npm i

COPY . .

EXPOSE 8000

CMD ["npm", "run", "Ovl"]
