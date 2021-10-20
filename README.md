# Twitterplayfeb(Twitter Tweets Streaming)

[![N|Solid](https://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1500,w_2000,f_auto,q_auto/1136722/388568_344831.png)](https://www.quantumventura.com/)

Stream all the live tweets based on the user keyword and classify Tweets

### Features
  - Custom keyword Tweet search
  - All keyword Tweet Search
  - All hashtag tweet search
  - Positive/ Negative/ Neutral Tweets processing based on sentiment analysis
  - popular keyword
  - hashtags
  - Live tweets and Retweets
  - influential users
  - Active Users
  - Google Trends
  - Geo-Location for Live Tweets
  - Processed Tweets History dashboard
  - Tweet Details Graph
  - Device Info Graph
  - Processed Tweets Graph
  - Language Info Graph
  - User Audit Log

### PreRequisites:
  - Node v8.17.0
  - ElasticSearch 6.7 or above
  - PeliasMap Geo
  - RabbitMQ
  - MongoDB 4.0 with replica
  - pm2(npm install -g pm2) v8.17.0
  - Linux x86_64 or Windows 8 and above (Recommended Ubuntu 18.04)

# Application Setup Steps(Follow Manual Setup or Docker)
### Step1:
SetUp Nodejs with necessary packages
### Step2:
Setup RabbitMQ and its admin dashboard with default url http://104.215.100.217:15672/#/queues, 104.215.100.217 VM's public IP
### Step3:
Follow either manual or automated method to create MongoDB replica
- Manual Execution
   Setup MongoDB followed by below steps
    # Reference Url https://www.tutorialkart.com/mongodb/setup-mongodb-replica-set/
    ```sh
      # Start a mongod instance.
      mongod --port 27017 --dbpath /data/db --replSet rs0
      # Start another mongod instance.
      mongod --port 27018 --dbpath /data/db1 --replSet rs0
      # Start Replication.
      rs.initiate()
      # Add host with secondary port in Primary shell
      rs.add("localhost:27018");
      mongo shell
      mongo --port 27018  #Open Secondary DB shell
      # Allow secondary db to read data
      rs.slaveOk() # Run this in secondary shell
    ```
- Automated Execution    
      Install pm2 globally
    ```sh
            npm install -g pm2
    ```
    After pm2 installation run the below script in <file name>.sh file

        mkdir -p /data/db
        mkdir -p /data/db1
        pm2 start "mongod --port 27017 --dbpath /data/db --replSet rs0" --name master
        pm2 start "mongod --port 27018 --dbpath /data/db1 --replSet rs0" --name slave

        mongo_host=localhost

        mongo --host localhost:27018 <<EOF
          var config = {"_id" : "rs0", "members" : [{"_id" : 0, "host" : "localhost:27017"},{"_id" : 1, "host" : "localhost:27018"}]};
          rs.initiate(config);
          rs.slaveOk();
        EOF

### Step4:
SetUp Pelias with ElasticSearch.Refer
  - https://github.com/pelias/documentation
  - https://github.com/pelias/documentation/blob/master/pelias_from_scratch.md

Pelias Api module will run the service
Pelias Schema module will create index
Pelias geoname, openaddress etc will load the data to elastic ElasticSearch
Configure elaticsearch and pelias in pelias.json. Pelias Api module by default will always look for pelias.json in home directory.Use pelias_config as environment variable to change the default config path

### Step5:
Setup and Run ElasticSearch Search
    Run in background=> ./bin/elasticsearch -d -p pid
    kill ES deamon=> pkill -F pid


### Port forwarding steps if necessary
    ssh -L 10.0.2.4:9091:localhost:9091 aswin1906@Orthus.nic.uoregon.edu -fN  # Twitterplay App
    ssh -L 10.0.2.4:9200:localhost:9200 aswin1906@Orthus.nic.uoregon.edu -fN  # ElasticSearch
    ssh -L 10.0.2.4:3100:localhost:3100 aswin1906@Orthus.nic.uoregon.edu -fN  # Pelias API service for map

# Docker Setup

### Create Network:
```sh
docker network create --driver bridge tp-network
```
### Mongo with replica:
Refer: https://www.sohamkamani.com/blog/2016/06/30/docker-mongo-replica-set/
```sh
docker run --rm -itd --publish 27018:27017 --name tp-mongo-master --network tp-network aswin1906/tp-mongodb4.0:1.0 mongod --replSet rs0

docker run --rm -itd --publish 27019:27017 --name tp-mongo-slave --network tp-network aswin1906/tp-mongodb4.0:1.0 mongod --replSet rs0
```

### Mongo Replica:
docker exec -it tp-mongo-master mongo
  ```sh
  config = {"_id" : "rs0", "members" : [{"_id" : 0, "host" : "tp-mongo-master:27017"},{"_id" : 1, "host" : "tp-mongo-slave:27017"}]}
  rs.initiate(config)
  rs.slaveOk()
  ```
### MongoExpress:
    docker run -itd --network tp-network -e ME_CONFIG_MONGODB_SERVER=tp-mongo-master -p 8081:8081 tp-mongo-express:1.0
Mongo Express Login:
    username: twitterplay
    password: twitterplay
### RabbitMQ:
    docker run -itd --publish 15678:15672 --publish 5678:5672 –name tp-rabbitmq –network tp-network aswin1906/tp-rabbitmq:3.6.8

### ElasticSearch:
   docker run --rm -itd --publish 9200:9200 --network tp-network aswin1906/tp-elasticsearch-6.8.3:1.0 -Xmx10g -Xms10g (https://hub.docker.com/layers/pelias/elasticsearch/6.8.3/images/sha256-62d71ceadc319bfaaa5aad12212e0b434407e1e99990674667c0f883b62799c3?context=explore)

### pelias API:
    docker run -itd --publish 3100:3100 --name tp-pelias-api --network tp-network pelias-api:1.0

### Inspect Network:
   docker inspect tp-network

### Env File:
 - Refer environment.ts and edit according to available machine configurations

```sh
ENV_ENABLED= true
NODE_ENV= 'prod'
NODE_HOST= 'localhost'
PORT= 8085
WINSTON_PORT= 9092
PROTOCOL= 'http'
PELIAS_HOST= 'localhost'
PELIAS_PORT= 3100
MONGO_CONN_URL= 'mongodb://localhost:27017/twitterplay?replicaSet=rs0'
RABBIT_MQ_CONN_URL= 'guest:guest@0.0.0.0:5678'
```

### TwitterPlay Docker Image:
    docker run --rm -itd --name twitterplay --network tp-network --publish 9091:9091 aswin1906/twitterplay:1.0 node server.js

# Docker Compose
```sh
cd docker && bash docker.sh
```
### Env file For Docker Compose belongs to TwitterPlay
 - Refer environment.ts and edit according to available machine configurations
```sh
ENV_ENABLED= true
NODE_ENV= 'prod'
NODE_HOST= 'localhost'
PORT= 8085
WINSTON_PORT= 9092
PROTOCOL= 'http'
PELIAS_HOST= 'localhost'
PELIAS_PORT= 3100
MONGO_CONN_URL= 'mongodb://localhost:27017/twitterplay?replicaSet=rs0'
RABBIT_MQ_CONN_URL= 'guest:guest@0.0.0.0:5678'
```

### Kubernetes
  - Architecture https://docs.google.com/document/d/1eXatDNDBW0Gsl4-FWBadmXUWtklCoOnGeV0H7vnpgQs/edit
  - Minikube Drivers https://kubernetes.io/docs/setup/learning-environment/minikube/#specifying-the-vm-driver
  - Kubectl & minikube setup https://phoenixnap.com/kb/install-minikube-on-ubuntu

License
----

MIT
