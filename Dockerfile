FROM ubuntu:18.04

MAINTAINER aswin1906@gmail.com

WORKDIR /app/twitterplay

COPY . /app/twitterplay

ENV NODE_VERSION=8.17.0

RUN apt-get update && apt-get install -y nodejs npm git

RUN apt-get update && apt-get install -y tmux &&\
    apt-get update &&  apt-get install -y curl wget nano vim

RUN apt-get update && apt-get install -y build-essential libssl-dev

EXPOSE 9091

# Run the specified command within the container.
CMD [ "npm", "run", "start-dkr" ]

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
