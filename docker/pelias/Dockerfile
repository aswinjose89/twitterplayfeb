FROM ubuntu:18.04

MAINTAINER aswin1906@gmail.com

ENV WORK=/home/pelias

WORKDIR ${WORK}

COPY . ${WORK}

ENV NODE_VERSION=v13.5.0

RUN apt-get update && apt-get install -y nodejs npm git

RUN apt-get update && apt-get install -y tmux &&\
    apt-get update &&  apt-get install -y curl wget nano vim

RUN apt-get update && apt-get install -y build-essential libssl-dev

EXPOSE 3100 3000 8080 3102


# start service
CMD [ "./script/start" ]
