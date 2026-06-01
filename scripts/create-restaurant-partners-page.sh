#!/usr/bin/env bash
# =============================================================================
# create-restaurant-partners-page.sh
# Provisions the Restaurant Partners page in Shopify via Admin API.
#
# Usage:
#   source .env && bash scripts/create-restaurant-partners-page.sh
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
    echo "   ✅ Created: /pages/${handle} (template: page.${template_suffix}.json)"
  elif [ "$RESPONSE" = "422" ]; then
    echo "   ⚠️  Already exists: /pages/${handle} — skipping (or already created)"
  else
    echo "   ❌ Unexpected status ${RESPONSE} for ${handle}"
  fi
}

echo ""
echo "Celebrate Festival — Restaurant Partners Page Setup"
echo "============================================="
echo "Store: ${SHOPIFY_STORE}"
echo ""

create_page "Restaurant Partners" "restaurant-partners" "restaurant-partners"

echo ""
echo "Done! Verify your page:"
echo "  https://${SHOPIFY_STORE}/pages/restaurant-partners"
echo ""
