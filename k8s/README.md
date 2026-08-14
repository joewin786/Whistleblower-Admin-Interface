# Web Admin Kubernetes Manifests

## Image build & push

1. Build the production image locally:
   ```bash
   docker build -t ghcr.io/your-org/web-admin:latest .
   ```
2. Authenticate to your registry and push:
   ```bash
   docker push ghcr.io/your-org/web-admin:latest
   ```

## Secrets

Populate the placeholders in `web-admin.yaml` or create the secret directly from the `.env.local` file that already exists in the repo:

```bash
kubectl create namespace web-admin
kubectl -n web-admin create secret generic web-admin-secrets --from-env-file=.env.local \
  --dry-run=client -o yaml > k8s/web-admin-secrets.generated.yaml
```

Review `web-admin-secrets.generated.yaml`, remove non-secret `NEXT_PUBLIC_` entries if you prefer the ConfigMap usage, then apply it before the rest of the manifests.

## Apply the manifests

1. Adjust the host values inside `k8s/web-admin.yaml` (Ingress + TLS secret) to match your domain.
2. Apply the manifests in order:
   ```bash
   kubectl apply -f k8s/web-admin.yaml
   ```

## Post-deployment

- Point your DNS `admin.example.com` (or custom host) to the ingress controller.
- Make sure the TLS secret referenced by the ingress (`web-admin-tls`) exists (e.g., via cert-manager or manually).
- Scale the deployment via `kubectl -n web-admin scale deploy/web-admin --replicas=3` if needed.
