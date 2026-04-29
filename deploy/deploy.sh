#!/usr/bin/env bash
# BeadLab one-shot deploy to Kapple (a-c-a: subdomain + Caddy + HTTPS)
# 用法：BEADLAB_DOMAIN=beadlab.yourdomain.com ./deploy/deploy.sh
set -euo pipefail

: "${BEADLAB_DOMAIN:?Need BEADLAB_DOMAIN, e.g. BEADLAB_DOMAIN=beadlab.example.com $0}"
SSH_TARGET="${SSH_TARGET:-kapple}"
REMOTE_DIR="${REMOTE_DIR:-/opt/docker/beadlab}"

echo "==> Target: $SSH_TARGET  Domain: $BEADLAB_DOMAIN  Path: $REMOTE_DIR"

# 1) 远端建目录
ssh "$SSH_TARGET" "mkdir -p $REMOTE_DIR/deploy && mkdir -p $REMOTE_DIR/assets"

# 2) 同步源码（仅 index.html + assets + deploy 目录）
SRC="$(cd "$(dirname "$0")/.." && pwd)"
rsync -avz --delete \
  --exclude 'deploy/.env' --exclude '.git' --exclude 'node_modules' \
  "$SRC/index.html" "$SRC/assets/" "$SRC/deploy/" \
  "$SSH_TARGET:$REMOTE_DIR/"

# 3) 在远端写 .env 并启动
ssh "$SSH_TARGET" "cd $REMOTE_DIR/deploy && \
  echo 'BEADLAB_DOMAIN=$BEADLAB_DOMAIN' > .env && \
  docker compose --env-file .env up -d --remove-orphans && \
  docker compose ps"

echo ""
echo "==> Done.  Waiting 5s for Caddy to fetch certificate..."
sleep 5
curl -sI "https://$BEADLAB_DOMAIN/" | head -5 || echo "  (cert may still be provisioning, retry in 30s)"

echo ""
echo "🎉 https://$BEADLAB_DOMAIN/"
