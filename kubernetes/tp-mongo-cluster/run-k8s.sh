#!/bin/bash

current_dir=$(pwd)/tp-mongo-cluster

kubectl apply -f $current_dir/tp-mongo-namespace.yaml
kubectl apply -f $current_dir/tp-mongo-secret.yaml
kubectl apply -f $current_dir/tp-mongodb-configmap.yaml
kubectl apply -f $current_dir/tp-mongodb-headless-svc.yaml
kubectl apply -f $current_dir/tp-mongodb-statefulset.yaml


# kubectl expose pod/tp-mongodb-0 --type="NodePort" --port 27017 --target-port 27017 --type LoadBalancer --namespace=tp-mongo-namespace
# kubectl expose pod/tp-mongodb-1 --type="NodePort" --port 27017 --target-port 27017 --type LoadBalancer --namespace=tp-mongo-namespace
sleep 5
kubectl apply -f $current_dir/tp-mongo-express.yaml
kubectl -n tp-mongo-namespace get all -o wide
