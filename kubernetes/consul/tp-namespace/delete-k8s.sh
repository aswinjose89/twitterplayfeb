#!/bin/bash


kubectl delete deployment tp-rabbitmq --namespace=tp-namespace && kubectl delete svc tp-rabbitmq-svc --namespace=tp-namespace
kubectl delete deployment twitterplay --namespace=tp-namespace && kubectl delete svc twitterplay-svc --namespace=tp-namespace
kubectl delete pvc twitterplay-claim --namespace=tp-namespace

kubectl delete namespaces tp-namespace --namespace=tp-namespace
# kubectl delete deployment tp-mongo-express && kubectl delete svc tp-mongo-express-svc
