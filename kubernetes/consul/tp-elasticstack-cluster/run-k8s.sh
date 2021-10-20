#!/bin/bash

current_dir=$(pwd)/tp-elasticstack-cluster

# kubectl apply -f $current_dir/tp-elasticstack-namespace.yaml
kubectl apply -f $current_dir/tp-elasticsearch.yaml
kubectl apply -f $current_dir/tp-pelias-api.yaml
kubectl apply -f $current_dir/tp-kibana.yaml

# kubectl -n tp-elasticstack-namespace get all -o wide
