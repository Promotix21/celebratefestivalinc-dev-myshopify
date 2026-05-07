#!/bin/bash
# Safe push — always pulls live first so client edits aren't overwritten
set -e

STORE="celebratefestivalinc.myshopify.com"
THEME="148264910893"

if [ -n "$1" ]; then
  # push.sh file1 file2 ... — targeted push, no pull needed
  shopify theme push --store $STORE --theme $THEME --allow-live --only "$@"
else
  # Full push — pull first to capture any client edits
  echo "Pulling live theme first..."
  shopify theme pull --store $STORE --theme $THEME
  echo "Pushing local changes..."
  shopify theme push --store $STORE --theme $THEME --allow-live
fi
