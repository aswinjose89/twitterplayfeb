#!/bin/bash

mongo --host tp-mongo-master:27017 <<EOF
  var config = {"_id" : "rs0", "members" : [{"_id" : 0, "host" : "tp-mongo-master:27017"},{"_id" : 1, "host" : "tp-mongo-slave:27017"}]};
  rs.initiate(config);
  rs.slaveOk();
EOF

node server.js
