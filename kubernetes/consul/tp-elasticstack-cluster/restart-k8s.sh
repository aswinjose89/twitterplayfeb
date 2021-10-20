#!/bin/bash

kubectl -n service rollout restart deployment tp-elasticsearch --namespace=tp-elasticstack-namespace
kubectl -n service rollout restart deployment tp-pelias-api --namespace=tp-elasticstack-namespace
