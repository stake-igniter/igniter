CERT_DIR = "deploy/postgres/dev/certs"
CRT_PATH = CERT_DIR + "/server.crt"
KEY_PATH = CERT_DIR + "/server.key"
CSR_PATH = CERT_DIR + "/server.csr"
TLS_SECRET_PATH = "deploy/postgres/dev/postgres-tls.yml"
PG_SECRET_PATH = "deploy/postgres/dev/postgres-secrets.yml"
PG_SECRET_NAME = "postgres-secrets"
PG_SECRET_SQL_NAME = "postgres-secret-sql"
PG_SECRET_SQL_PATH = "deploy/postgres/dev/postgres-secret-sql.yml"
TEMPORAL_NAMESPACE = "temporal"

def base64_file(path):
    return str(local("base64 -i {}".format(path), quiet=True)).replace("\n", "")

def generate_password(length=24):
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    script = "import random; print(''.join(random.choice('{}') for _ in range({})))".format(charset, length)
    return str(local('python3 -c "{}"'.format(script), quiet=True)).strip()

if config.tilt_subcommand == 'up':
    print("🔼 Executing tilt up tasks...")
    if not os.path.exists(CRT_PATH) or not os.path.exists(KEY_PATH):
        print("🔐 Generating self-signed certificate...")
        local("mkdir -p {}".format(CERT_DIR))
        local('openssl req -new -nodes -text -out {} -keyout {} -subj "/CN=localhost"'.format(CSR_PATH, KEY_PATH))
        local('openssl x509 -req -in {} -signkey {} -out {} -days 365'.format(CSR_PATH, KEY_PATH, CRT_PATH))
        local('rm {}'.format(CSR_PATH))
        local('chmod 600 {}'.format(KEY_PATH))
        local('chmod 644 {}'.format(CRT_PATH))

        tls_crt_b64 = base64_file(CRT_PATH)
        tls_key_b64 = base64_file(KEY_PATH)

        tls_yaml = """
apiVersion: v1
kind: Secret
metadata:
  name: postgres-tls
type: kubernetes.io/tls
data:
  tls.crt: {crt}
  tls.key: {key}
""".format(crt=tls_crt_b64, key=tls_key_b64)

        local('printf "%s" "{}" > {}'.format(tls_yaml.replace('"', '\\"'), TLS_SECRET_PATH))

    if not os.path.exists(PG_SECRET_PATH):
        print("🔐 Generating postgres-secret with random password...")
        username = "postgres"
        password = generate_password()

        local("touch {}".format(PG_SECRET_PATH))
        local("kubectl create secret generic {} --from-literal=username={} --from-literal=password={} --dry-run=client -o yaml > {}".format(
            PG_SECRET_NAME,
            username,
            password,
            PG_SECRET_PATH
        ))

        print("🔗 Generating connection string secrets...")
        cluster = "postgres"
        namespace = "default"
        host = "{}-rw.{}.svc.cluster.local".format(cluster, namespace)
        middleman_db = "igniter_middleman"
        provider_db = "igniter_provider"
        middleman_conn_str = "postgres://{}:{}@{}:5432/{}?sslmode=disable".format(username, password, host, middleman_db)
        provider_conn_str = "postgres://{}:{}@{}:5432/{}?sslmode=disable".format(username, password, host, provider_db)

        # Replace or create the secret live in k8s for middleman
        local("kubectl delete secret postgres-middleman-connection --ignore-not-found --namespace={}".format(namespace))
        local("kubectl create secret generic postgres-middleman-connection \
          --from-literal=PGHOST={} \
          --from-literal=PGUSER={} \
          --from-literal=PGPASSWORD={} \
          --from-literal=DATABASE_URL='{}' \
          --from-literal=DB_NAME='{}' \
          --namespace={}".format(host, username, password, middleman_conn_str, middleman_db, namespace))

        # Replace or create the secret live in k8s for provider
        local("kubectl delete secret postgres-provider-connection --ignore-not-found --namespace={}".format(namespace))
        local("kubectl create secret generic postgres-provider-connection \
          --from-literal=PGHOST={} \
          --from-literal=PGUSER={} \
          --from-literal=PGPASSWORD={} \
          --from-literal=DATABASE_URL='{}' \
          --from-literal=DB_NAME='{}' \
          --namespace={}".format(host, username, password, provider_conn_str, provider_db, namespace))

        local("kubectl get namespace temporal || kubectl create namespace temporal")
        local("kubectl delete secret credentials --ignore-not-found --namespace={}".format(TEMPORAL_NAMESPACE))
        local("kubectl create secret generic credentials --from-literal=postgresql_pwd='{}' --namespace={}".format(password, TEMPORAL_NAMESPACE))

watch_settings(
    ignore=[
        TLS_SECRET_PATH,
        PG_SECRET_PATH,
        "deploy/postgres/dev/certs/*",
    ],
)

# === LOAD AND ORGANIZE RESOURCES ===
k8s_yaml(kustomize("deploy/postgres/dev"))

k8s_resource(
    objects=['postgres:cluster', 'postgres-tls:secret', 'postgres-secrets:secret'],
    new_name="Postgres Cluster",
    port_forwards=['5432:5432'],
    extra_pod_selectors=[{'cnpg.io/cluster': 'postgres'}],
)

# Install Temporal Server
load('ext://helm_resource', 'helm_resource', 'helm_repo')
helm_repo('temporal', 'https://go.temporal.io/helm-charts')
helm_resource(name='Temporal Server', release_name="temporal", chart="temporal/temporal", namespace="temporal", resource_deps=["temporal", "Postgres Cluster"], flags=["--create-namespace", "--values=deploy/temporal/values.yml"])

# Build and Load Middleman
docker_build(
    'igniter/middleman',
    context='.',
    dockerfile='deploy/middleman/middleman.dockerfile',
    live_update=[],
    ignore=['node_modules']
)

k8s_yaml(kustomize("deploy/middleman/dev"))

k8s_resource(
    "middleman",
    port_forwards=["3000:3000"],
    objects=['middleman-config','middleman-secrets'],
    extra_pod_selectors=[{"app": "middleman", "component": "web"}],
    new_name="Middleman Web"
)

# Build and Load Middleman Workflows
docker_build(
    'igniter/middleman-workflows',
    context='.',
    dockerfile='deploy/middleman-workflows/middleman-workflows.dockerfile',
    live_update=[],
    ignore=['node_modules']
)

k8s_yaml(kustomize("deploy/middleman-workflows/dev"))

k8s_resource(
    "middleman-workflows",
    objects=['middleman-workflows-config'],
    extra_pod_selectors=[{"app": "middleman", "component": "workflows-worker"}],
    new_name="Middleman Worker"
)

# Build and Load Provider
docker_build(
    'igniter/provider',
    context='.',
    dockerfile='deploy/provider/provider.dockerfile',
    live_update=[],
    ignore=['node_modules'],
)

k8s_yaml(kustomize("deploy/provider/dev"))

k8s_resource(
    "provider",
    port_forwards=["3001:3000"],
    objects=['provider-config','provider-secrets'],
    extra_pod_selectors=[{"app": "provider", "component": "web"}],
    new_name="Provider Web"
)

if config.tilt_subcommand == 'down':
    print("🔽 Executing tilt down cleanup...")
    paths_to_delete = [CRT_PATH, KEY_PATH, TLS_SECRET_PATH, PG_SECRET_PATH]
    for path in paths_to_delete:
        if os.path.exists(path):
            print("🗑️  Removing {}".format(path))
            local("rm -f {}".format(path))
