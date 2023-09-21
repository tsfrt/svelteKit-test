# SvelteKit Test App

This app demonstrates the configuration for running a SvelteKit app on TAP.  The app is configured to deploy on a Node runtime.  The app also detects service bindings to demonstrate mounting backing services.

## Worklad config

This is the workload definition used to mount the service binding.  Set the `DB_SERVICE_BINDING_NAME` env var for the desired binding.

By default this app is expecting an oracle binding because that is the current customer landscape, but can be easily tailored to use other DB's.

```yaml

---
apiVersion: carto.run/v1alpha1
kind: Workload
metadata:
  name: svelete-app2
  namespace: develop
  labels:
    app.kubernetes.io/part-of: svelete-app
    apps.tanzu.vmware.com/workload-type: web
spec:
  serviceClaims:
  - name: oracle-binding
    ref:
      apiVersion: services.apps.tanzu.vmware.com/v1alpha1                
      kind: ResourceClaim
      name: external-oracle-db-claim
  source:
    git:
      url: https://github.com/tsfrt/svelteKit-test
      ref:
        branch: main
  build:
    env:
      - name: NODE_OPTIONS
        value: ""


```