#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------
# Config (override via env)
# ---------------------------------------------
NAMESPACES="${NAMESPACES:-provider middleman}"   # space-separated list
ADDRESS="${TEMPORAL_ADDRESS:-temporal:7233}"     # Temporal server (docker compose service)

# ---------------------------------------------
# Helpers
# ---------------------------------------------
temporal_cli() {
  temporal --address "$ADDRESS" "$@"
}

wait_for_temporal() {
  echo "Waiting for Temporal at $ADDRESS ..."
  local tries=0
  until temporal_cli cluster health >/dev/null 2>&1 || temporal_cli operator namespace list >/dev/null 2>&1; do
    tries=$((tries+1))
    if (( tries > 60 )); then
      echo "Timed out waiting for Temporal at $ADDRESS" >&2
      exit 1
    fi
    sleep 2
  done
  echo "Temporal is reachable."
}

ns_exists() {
  local ns="$1"
  if temporal_cli operator namespace describe -n "$ns" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

create_ns() {
  local ns="$1"
  if ns_exists "$ns"; then
    echo "Namespace '$ns' already exists — skipping create."
    return 0
  fi

  echo "Creating namespace '$ns' ..."
  temporal_cli operator namespace create -n "$ns"

  # Verify creation
  temporal_cli operator namespace describe -n "$ns" >/dev/null
  echo "Namespace '$ns' created."
}

# ---------------------------------------------
# Main
# ---------------------------------------------
wait_for_temporal

for ns in $NAMESPACES; do
  # Backoff + retry creation in case the cluster just came up
  tries=0
  until create_ns "$ns"; do
    tries=$((tries+1))
    if (( tries > 5 )); then
      echo "Failed to create namespace '$ns' after retries." >&2
      exit 1
    fi
    sleep $((tries * 2))
  done
done

echo "✅ All namespaces ensured: $NAMESPACES"
echo "✅ All setup tasks completed successfully — exiting script."
