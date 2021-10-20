### Kubernetes commands belongs to Twitterplay to create pods

    kubectl apply -f tp-namespace.yaml
    kubectl apply -f tp-rabbitmq.yaml
    kubectl apply -f twitterplay.yaml

### Kubernetes commands belongs to Twitterplay
    kubectl get pods --namespace=tp-namespace
    kubectl get svc --namespace=tp-namespace
    kubectl get pvc --namespace=tp-namespace
    kubectl -n tp-namespace get all

### Kubernetes execution commands belongs to Twitterplay to access pod
    kubectl exec -it twitterplay --namespace=tp-namespace -- bash

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
