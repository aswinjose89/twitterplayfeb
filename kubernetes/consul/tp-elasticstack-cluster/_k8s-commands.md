### Kubernetes commands belongs to Twitterplay to create pods

    kubectl apply -f tp-elasticstack-namespace.yaml
    kubectl apply -f tp-elasticsearch.yaml
    kubectl apply -f tp-pelias-api.yaml

### Kubernetes commands belongs to Twitterplay
    kubectl get pods --namespace=tp-elasticstack-namespace
    kubectl get svc --namespace=tp-elasticstack-namespace
    kubectl get pvc --namespace=tp-elasticstack-namespace
    kubectl get configmap --namespace=tp-elasticstack-namespace
    kubectl -n tp-elasticstack-namespace get all

### Kubernetes execution commands belongs to Twitterplay to access pod
    kubectl exec -it tp-pelias-api --namespace=tp-elasticstack-namespace -- bash

### kubectl get commands

    kubectl get pod
    kubectl get pod --watch
    kubectl get pod -o wide
    kubectl get service
    kubectl get secret
    kubectl get all | grep mongodb

### kubectl debugging commands

    kubectl describe pod mongodb-deployment-xxxxxx
    kubectl describe service mongodb-service
    kubectl logs mongo-express-xxxxxx

### give a URL to external service in minikube

    minikube service mongo-express-service
