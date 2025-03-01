# Install NATS Server

Add the repo 
```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install nats nats/nats --set namespaceOverride=pepr-system
```
