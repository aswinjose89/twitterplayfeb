# https://www.tutorialkart.com/mongodb/setup-mongodb-replica-set/
# Start a mongod instance.
mongod --port 27017 --dbpath /data/db --replSet rs0
# Start another mongod instance.
mongod --port 27018 --dbpath /data/db1 --replSet rs0
# open Primary shell
mongo --port 27017  #Open Secondary DB shell
# Start Replication- run 'initiate' in primary shell.
rs.initiate()
# Add host with secondary port in Primary shell
rs.add("localhost:27018"); 
mongo shell
mongo --port 27018  #Open Secondary DB shell
# Allow secondary db to read data
rs.slaveOk() # Run this in secondary shell