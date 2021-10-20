#!/bin/bash

docker system prune

mkdir -p ~/tpData/master
mkdir -p ~/tpData/slave
# docker container rm tp-mongo-master tp-mongo-slave twitterplay --force
 # docker-compose up
docker-compose up -d

exit
