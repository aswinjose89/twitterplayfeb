#!/bin/bash

current_dir=$(pwd)/tp-namespace

# kubectl apply -f $current_dir/tp-namespace.yaml
kubectl apply -f $current_dir/tp-rabbitmq.yaml
kubectl apply -f $current_dir/twitterplay.yaml


# kubectl -n tp-namespace get all -o wide
