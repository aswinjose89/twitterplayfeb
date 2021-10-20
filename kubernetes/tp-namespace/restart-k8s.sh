#!/bin/bash

kubectl -n service rollout restart deployment tp-rabbitmq --namespace=tp-namespace
kubectl -n service rollout restart deployment twitterplay --namespace=tp-namespace
