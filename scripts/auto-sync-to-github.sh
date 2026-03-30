#!/bin/bash
# Auto-commit and push changes in the portfolio folder to GitHub
# Place this script on your VPS and run as a systemd service or cron job for automation

REPO_DIR="/home/ubuntu/portfolio"
BRANCH="main"
GIT_USER="vps-auto-sync"
GIT_EMAIL="vps-auto-sync@localhost"

cd "$REPO_DIR" || exit 1

git add -A
if ! git diff --cached --quiet; then
  git config user.name "$GIT_USER"
  git config user.email "$GIT_EMAIL"
  git commit -m "chore: auto-sync from VPS [skip ci]"
  git pull --rebase origin "$BRANCH"
  git push origin "$BRANCH"
else
  echo "No changes to commit."
fi
