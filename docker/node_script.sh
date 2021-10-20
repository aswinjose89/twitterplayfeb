#!/bin/bash

echo "sleeping for 30 seconds"
sleep 30

NODE_ENV='docker' PORT=9091 WINSTON_PORT=9092 NODE_HOST='twitterplay' MONGO_CONN_URL='mongodb://tp-mongo-master:27017/twitterplay?replicaSet=rs0' PELIAS_HOST='tp-pelias-api' RABBIT_MQ_CONN_URL='guest:guest@tp-rabbitmq:5678' node --no-warnings --no-deprecation --max_old_space_size=8000 server.js
