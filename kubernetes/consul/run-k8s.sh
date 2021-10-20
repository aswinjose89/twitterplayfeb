#!/bin/bash


# helm repo add hashicorp https://helm.releases.hashicorp.com
# helm install -f consul-values.yml hashicorp hashicorp/consul
# minikube service list
#
# source tp-mongo-cluster/run-k8s.sh
# source tp-elasticstack-cluster/run-k8s.sh
# source tp-namespace/run-k8s.sh


# kubectl -n tp-elasticstack-namespace get all -o wide


consul config write sd-twitterplay.hcl
consul config write sd-rabbitmq.hcl
consul config write sd-mongoexpress.hcl
consul config write sd-kibana.hcl
consul config write sd-elasticsearch.hcl
consul config write ingress-gateway.hcl

# kubectl port-forward service/twitterplay-svc 9098:9098
#
# EXTERNAL_IP=$(kubectl get services | grep ingress-gateway | awk '{print $4}')
# curl -H "Host: static-server.ingress.consul" $EXTERNAL_IP:8080
