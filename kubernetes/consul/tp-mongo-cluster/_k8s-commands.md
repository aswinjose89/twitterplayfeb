### Kubernetes commands belongs to Twitterplay to create pods

    kubectl apply -f tp-mongo-namespace.yaml
    kubectl apply -f tp-mongo-secret.yaml
    kubectl apply -f tp-mongodb-configmap.yaml
    kubectl apply -f tp-mongodb-headless-svc.yaml
    kubectl apply -f tp-mongodb-statefulset.yaml

### Create a NodePort for each replica pod
    kubectl expose pod/tp-mongodb-0 --type="NodePort" --port 27017 --target-port 27017 --type LoadBalancer --namespace=tp-mongo-namespace
    kubectl expose pod/tp-mongodb-1 --type="NodePort" --port 27017 --target-port 27017 --type LoadBalancer --namespace=tp-mongo-namespace

### Kubernetes commands belongs to Twitterplay
    kubectl get pods --namespace=tp-mongo-namespace
    kubectl get svc --namespace=tp-mongo-namespace
    kubectl get pvc --namespace=tp-mongo-namespace
    kubectl get configmap --namespace=tp-mongo-namespace
    kubectl -n tp-mongo-namespace get all
    kubectl get namespace

### Kubernetes execution commands belongs to Twitterplay to access mongodb
    kubectl exec -it tp-mongodb-0 --namespace=tp-mongo-namespace -- mongo

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

### minikube tunnel to invoke loadBalancer
    minikube tunnel
    study => https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-tunnel

### Reset Kubernetes
    kubeadm reset
