#!/usr/bin/env bash
# =============================================================================
# create-ai-pages.sh
# Provisions the 4 AI discovery pages in Shopify via Admin API.
# Run once. Pages are set as hidden (no SEO/nav exposure) but accessible by URL.
#
# Usage:
#   source .env && bash scripts/create-ai-pages.sh
# =============================================================================

set -euo pipefail

API_BASE="https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}"
AUTH_HEADER="X-Shopify-Access-Token: ${SHOPIFY_API_TOKEN}"

create_page() {
  local title="$1"
  local handle="$2"
  local template_suffix="$3"

  echo "→ Creating page: ${handle} ..."

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${API_BASE}/pages.json" \
    -H "${AUTH_HEADER}" \
    -H "Content-Type: application/json" \
    -d "{
      \"page\": {
        \"title\": \"${title}\",
        \"handle\": \"${handle}\",
        \"template_suffix\": \"${template_suffix}\",
        \"body_html\": \"\",
        \"published\": true
      }
    }")

  if [ "$RESPONSE" = "201" ]; then
    echo "   ✅ Created: /pages/${handle} (template: page.${template_suffix}.liquid)"
  elif [ "$RESPONSE" = "422" ]; then
    echo "   ⚠️  Already exists: /pages/${handle} — skipping"
  else
    echo "   ❌ Unexpected status ${RESPONSE} for ${handle}"
  fi
}

echo ""
echo "Celebrate Festival — AI Discovery Pages Setup"
echo "============================================="
echo "Store: ${SHOPIFY_STORE}"
echo ""

create_page "API Catalog"      "api-catalog"     "api-catalog"
create_page "OpenAPI Spec"     "openapi"         "openapi"
create_page "Agent Skills"     "agent-skills"    "agent-skills"
create_page "MCP Server Card"  "mcp-server-card" "mcp-server-card"

echo ""
echo "Done! Verify your pages:"
echo "  https://${SHOPIFY_STORE}/pages/api-catalog"
echo "  https://${SHOPIFY_STORE}/pages/openapi"
echo "  https://${SHOPIFY_STORE}/pages/agent-skills"
echo "  https://${SHOPIFY_STORE}/pages/mcp-server-card"
echo ""
echo "Next: push theme → shopify theme push --theme ${SHOPIFY_THEME_ID}"
