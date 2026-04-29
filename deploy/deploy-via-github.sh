#!/usr/bin/env bash
# 在 Mac 上运行：通过 GitHub 私库部署 BeadLab 到 Kapple。
# 用法：
#   BEADLAB_DOMAIN=beadlab.yourdomain.com bash deploy/deploy-via-github.sh
# 或者一键（cd 进项目后）：
#   BEADLAB_DOMAIN=beadlab.yourdomain.com bash deploy-via-github.sh

set -euo pipefail

: "${BEADLAB_DOMAIN:?Need BEADLAB_DOMAIN, e.g. BEADLAB_DOMAIN=beadlab.example.com $0}"
SSH_TARGET="${SSH_TARGET:-kapple}"
REMOTE_DIR="${REMOTE_DIR:-/opt/docker/beadlab}"
REPO_URL="${REPO_URL:-git@github.com:KerroKapple/Perler.git}"
BRANCH="${BRANCH:-main}"

echo "==> Target: $SSH_TARGET   Domain: $BEADLAB_DOMAIN   Path: $REMOTE_DIR"
echo "==> Repo: $REPO_URL  Branch: $BRANCH"
echo ""

# 通过 SSH 在 Kapple 上执行：clone 或 pull → 启 Caddy
ssh -A "$SSH_TARGET" bash -se <<EOF
set -euo pipefail
mkdir -p "$REMOTE_DIR"
cd "$REMOTE_DIR"
if [ -d .git ]; then
  echo "[remote] git fetch + reset"
  git fetch --all --prune
  git reset --hard "origin/$BRANCH"
else
  echo "[remote] git clone (with SSH agent forwarding)"
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" .
fi

cd deploy
echo "BEADLAB_DOMAIN=$BEADLAB_DOMAIN" > .env

echo "[remote] docker compose up -d"
docker compose --env-file .env up -d --remove-orphans
docker compose ps
EOF

echo ""
echo "==> Waiting 6s for Caddy to fetch certificate..."
sleep 6
curl -sI "https://$BEADLAB_DOMAIN/" | head -5 || echo "  (cert may still be provisioning, retry in ~30s)"

echo ""
echo "🎉 https://$BEADLAB_DOMAIN/"
