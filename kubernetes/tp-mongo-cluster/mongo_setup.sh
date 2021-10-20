#!/bin/bash

echo mongo_setup.sh time now: `date +"%T" `
mongo --host tp-mongodb-0.tp-mongodb-svc:27017 <<EOF
  var config = {"_id" : "rs0", "members" : [{"_id" : 0, "host" : "tp-mongodb-0.tp-mongodb-svc:27017"},{"_id" : 1, "host" : "tp-mongodb-1.tp-mongodb-svc:27017"}]};
  rs.initiate(config);
  rs.slaveOk();
EOF
