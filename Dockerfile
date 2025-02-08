FROM node:lts-alpine

RUN RUN apk add --no-cache \
    git \
    ffmpeg \
    vips \
    vips-dev \
    gcc \
    g++ \
    make \
    python3
    
RUN git clone https://github.com/Ainz-fk/OVL-MD.git /ovl_bot

WORKDIR /ovl_bot

COPY package.json .

RUN npm i --platform=linuxmusl --arch=x64 sharp && npm i

COPY . .

EXPOSE 8000

CMD ["npm", "run", "Ovl"]
