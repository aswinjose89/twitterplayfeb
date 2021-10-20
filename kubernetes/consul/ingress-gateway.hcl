Kind = "ingress-gateway"
Name = "twitter-ingress-gateway"

Listeners = [
 {
   Port = 9098
   Protocol = "http"
   Services = [
     {
       Name = "twitterplay"
     }
   ]
 },
 {
   Port = 15678
   Protocol = "http"
   Services = [
     {
       Name = "tp-rabbitmq"
     }
   ]
 },
 {
   Port = 9093
   Protocol = "http"
   Services = [
     {
       Name = "tp-mongo-express"
     }
   ]
 },
 {
   Port = 9200
   Protocol = "http"
   Services = [
     {
       Name = "tp-elasticsearch"
     }
   ]
 },
 {
   Port = 5601
   Protocol = "http"
   Services = [
     {
       Name = "tp-kibana"
     }
   ]
 }
]
