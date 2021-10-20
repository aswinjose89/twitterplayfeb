# 10.0.2.4 = Twitterplay VM
ssh -L 10.0.2.4:9091:localhost:9091 aswin1906@Orthus.nic.uoregon.edu -fN  # Twitterplay App
ssh -L 10.0.2.4:9200:localhost:9200 aswin1906@Orthus.nic.uoregon.edu -fN  # ElasticSearch
ssh -L 10.0.2.4:3100:localhost:3100 aswin1906@Orthus.nic.uoregon.edu -fN  # Pelias API service for map