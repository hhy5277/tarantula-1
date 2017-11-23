FROM hub.c.163.com/library/node:8.9.1-alpine

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV TERM xterm
ENV NODE_SASS_PLATFORM alpine
ENV NODE_ENV production

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add -U tzdata nano git python build-base curl bash file gcc g++ make curl-dev
RUN cp /usr/share/zoneinfo/Asia/Chongqing /etc/localtime

copy .npmrc package.json /www/

WORKDIR /www
RUN npm i --registry https://registry.npm.taobao.org

COPY . /www/
RUN npm run build

ENTRYPOINT ./node_modules/.bin/sequelize db:migrate && pm2 start pm2.yml --no-daemon
