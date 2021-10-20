#!/bin/bash

ns='default'

kubectl delete --all pods --namespace=$ns
kubectl delete --all deployments --namespace=$ns
kubectl delete --all svc --namespace=$ns
kubectl delete --all daemonset --namespace=$ns
kubectl delete --all statefulset --namespace=$ns
helm repo remove hashicorp
kubeadm reset
minikube start
# kubectl delete deployment tp-mongo-express && kubectl delete svc tp-mongo-express-svc
