#!/bin/bash
echo "sleeping for 10 seconds"
sleep 10

echo mongo_setup.sh time now: `date +"%T" `
mongo --host tp-mongo-master:27017 <<EOF
  var config = {"_id" : "rs0", "members" : [{"_id" : 0, "host" : "tp-mongo-master:27017"},{"_id" : 1, "host" : "tp-mongo-slave:27017"}]};
  rs.initiate(config);
  rs.slaveOk();
EOF
