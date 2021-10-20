#!/bin/bash

kubectl delete Secret tp-mongo-secret --namespace=tp-mongo-namespace
kubectl delete statefulset tp-mongodb --namespace=tp-mongo-namespace && kubectl delete svc tp-mongodb-svc --namespace=tp-mongo-namespace
kubectl delete pvc tp-mongodb-claim --namespace=tp-mongo-namespace
kubectl delete ConfigMap tp-mongodb-configmap --namespace=tp-mongo-namespace


kubectl delete deployment tp-mongo-express --namespace=tp-mongo-namespace
kubectl delete svc tp-mongo-express-svc --namespace=tp-mongo-namespace

kubectl delete svc tp-mongodb-0-svc --namespace=tp-mongo-namespace && kubectl delete svc tp-mongodb-1-svc --namespace=tp-mongo-namespace

kubectl delete namespaces tp-mongo-namespace --namespace=tp-mongo-namespace
# kubectl delete deployment tp-mongo-express && kubectl delete svc tp-mongo-express-svc
