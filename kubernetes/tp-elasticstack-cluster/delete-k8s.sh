#!/bin/bash

kubectl delete deployment tp-elasticsearch --namespace=tp-elasticstack-namespace && kubectl delete svc tp-elasticsearch-svc --namespace=tp-elasticstack-namespace
kubectl delete deployment tp-pelias-api --namespace=tp-elasticstack-namespace && kubectl delete svc tp-pelias-api-svc --namespace=tp-elasticstack-namespace
kubectl delete pvc tp-pelias-api-claim --namespace=tp-elasticstack-namespace

kubectl delete namespaces tp-elasticstack-namespace --namespace=tp-elasticstack-namespace
# kubectl delete deployment tp-mongo-express && kubectl delete svc tp-mongo-express-svc
