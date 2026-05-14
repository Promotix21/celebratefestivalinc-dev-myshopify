/**
 * well-known.js — AI/Agent discovery endpoints
 * Mounted at /wk/ in server.js
 * Accessible via Shopify App Proxy: /apps/wk/*
 *
 * App Proxy setup (Shopify Partner Dashboard):
 *   Subpath prefix: wk
 *   Proxy URL: http://31.220.21.130:3001/wk
 *
 * Endpoints:
 *   GET /wk/.well-known/api-catalog
 *   GET /wk/.well-known/oauth-protected-resource
 *   GET /wk/.well-known/agent-skills/index.json
 *   GET /wk/.well-known/mcp/server-card.json
 *   GET /wk/openapi.json
 */

const express = require('express');
const router = express.Router();

const BASE_URL = 'https://celebratefestivalinc.myshopify.com';
const PROXY_BASE = `${BASE_URL}/apps/wk`;

// Shared headers for all AI discovery responses
function setDiscoveryHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('X-Content-Signal', 'search=yes; ai-input=yes; ai-train=no');
  res.setHeader('X-Robots-Tag', 'index, follow');
}

router.options('*', (req, res) => {
  setDiscoveryHeaders(res);
  res.sendStatus(204);
});

// ---------------------------------------------------------------------------
// GET /wk/.well-known/api-catalog
// RFC-style API catalog (inspired by IETF draft-ietf-httpapi-linkset-format)
// ---------------------------------------------------------------------------
router.get('/.well-known/api-catalog', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({
    schema_version: '1.0',
    title: 'Celebrate Festival Inc API Catalog',
    description: 'Machine-readable catalog of APIs available for the Celebrate Festival Inc B2B restaurant equipment storefront.',
    contact: {
      name: 'Hiraya Digital',
      email: 'dev@hiraya.digital',
      url: 'https://hiraya.digital'
    },
    apis: [
      {
        id: 'shopify-storefront',
        title: 'Shopify Storefront API',
        description: 'Shopify Storefront GraphQL API for browsing products, collections, and cart management.',
        specUrl: `${PROXY_BASE}/openapi.json`,
        specMediaType: 'application/json',
        docsUrl: 'https://shopify.dev/docs/api/storefront',
        authorizationUrl: `${BASE_URL}/admin/oauth/authorize`,
        version: '2024-10',
        tags: ['storefront', 'products', 'cart', 'b2b', 'wholesale']
      },
      {
        id: 'cf-chatbot-api',
        title: 'Celebrate Festival AI Assistant API',
        description: 'AI-powered product discovery, SKU lookup, and shopping assistance for B2B buyers.',
        specUrl: `${PROXY_BASE}/openapi.json`,
        specMediaType: 'application/json',
        version: '1.0.0',
        tags: ['ai', 'search', 'sku', 'assistant', 'b2b']
      }
    ]
  });
});

// ---------------------------------------------------------------------------
// GET /wk/.well-known/oauth-protected-resource
// RFC 8707 — OAuth 2.0 Protected Resource Metadata
// ---------------------------------------------------------------------------
router.get('/.well-known/oauth-protected-resource', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({
    resource: BASE_URL,
    authorization_servers: [
      `${BASE_URL}/admin/oauth/authorize`
    ],
    scopes_supported: [
      'read_products',
      'read_collection_listings',
      'read_product_listings',
      'unauthenticated_read_product_listings',
      'unauthenticated_read_collection_listings',
      'unauthenticated_read_product_tags'
    ],
    bearer_methods_supported: ['header', 'query'],
    resource_documentation: 'https://shopify.dev/docs/api/storefront',
    resource_signing_alg_values_supported: ['RS256'],
    introspection_endpoint: null,
    jwks_uri: 'https://celebratefestivalinc.myshopify.com/.well-known/jwks.json'
  });
});

// ---------------------------------------------------------------------------
// GET /wk/.well-known/agent-skills/index.json
// Agent Skills discovery index — describes what AI agents can do on this site
// ---------------------------------------------------------------------------
router.get('/.well-known/agent-skills/index.json', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({
    schema_version: '1.0',
    name: 'Celebrate Festival Inc Agent Skills',
    description: 'Skills available for AI agents interacting with the Celebrate Festival Inc B2B restaurant equipment store.',
    base_url: BASE_URL,
    skills: [
      {
        id: 'product-search',
        name: 'Product Search',
        description: 'Search the catalog of restaurant and commercial kitchen equipment by keyword, category, or brand.',
        endpoint: '/search?q={query}',
        method: 'GET',
        parameters: [
          { name: 'query', type: 'string', in: 'query', required: true, description: 'Search keywords, product name, or SKU' },
          { name: 'sort_by', type: 'string', in: 'query', required: false, description: 'Sort order: best-selling, price-ascending, price-descending' }
        ],
        examples: [
          { description: 'Search for commercial ovens', url: '/search?q=commercial+oven' },
          { description: 'Search by SKU', url: '/search?q=R301' }
        ]
      },
      {
        id: 'product-discovery',
        name: 'Product Discovery by Category',
        description: 'Browse the equipment catalog by category hierarchy (L1 → L2 → L3 collections).',
        endpoint: '/collections/{handle}',
        method: 'GET',
        parameters: [
          { name: 'handle', type: 'string', in: 'path', required: true, description: 'Collection URL handle (e.g., commercial-ovens, food-preparation)' }
        ],
        examples: [
          { description: 'Browse commercial ovens', url: '/collections/commercial-ovens' },
          { description: 'Browse food prep equipment', url: '/collections/food-preparation' }
        ]
      },
      {
        id: 'product-detail',
        name: 'Product Detail Lookup',
        description: 'Retrieve full product details including pricing, variants, specifications, and availability.',
        endpoint: '/products/{handle}',
        method: 'GET',
        parameters: [
          { name: 'handle', type: 'string', in: 'path', required: true, description: 'Product URL handle' }
        ]
      },
      {
        id: 'shopping-assistance',
        name: 'AI Shopping Assistant',
        description: 'Conversational AI assistant for product recommendations, B2B pricing inquiries, and order guidance.',
        endpoint: '/pages/ai-assistant',
        method: 'GET',
        interaction_model: 'conversational',
        tags: ['ai', 'chat', 'recommendations', 'b2b-pricing']
      },
      {
        id: 'cart-management',
        name: 'Cart Functionality',
        description: 'Add products to cart, update quantities, and view cart via Shopify Cart API.',
        endpoint: '/cart',
        method: 'GET',
        api_endpoints: [
          { path: '/cart/add.js', method: 'POST', description: 'Add item to cart' },
          { path: '/cart/update.js', method: 'POST', description: 'Update cart quantities' },
          { path: '/cart.js', method: 'GET', description: 'Get current cart state' }
        ]
      },
      {
        id: 'catalog-browsing',
        name: 'Catalog Browsing',
        description: 'Browse the full product catalog with filtering by vendor, price, and product attributes.',
        endpoint: '/collections',
        method: 'GET',
        sitemap: `${BASE_URL}/sitemap.xml`,
        catalog_api: 'https://shopify.dev/docs/api/storefront'
      },
      {
        id: 'member-pricing',
        name: 'B2B Member Pricing',
        description: 'Wholesale member pricing tier available for registered B2B buyers (CPH, ROU tags). Requires account login.',
        auth_required: true,
        login_url: `${BASE_URL}/account/login`,
        membership_url: `${BASE_URL}/pages/membership`,
        tags: ['b2b', 'wholesale', 'pricing', 'members-only']
      }
    ]
  });
});

// ---------------------------------------------------------------------------
// GET /wk/.well-known/mcp/server-card.json
// Model Context Protocol server discovery card
// ---------------------------------------------------------------------------
router.get('/.well-known/mcp/server-card.json', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({
    schema_version: '0.1',
    name: 'Celebrate Festival Inc',
    display_name: 'Celebrate Festival Inc — Restaurant Equipment',
    version: '1.0.0',
    description: 'MCP server for B2B restaurant and commercial kitchen equipment catalog. Supports product search, catalog browsing, SKU lookup, and shopping assistance for foodservice industry buyers.',
    icon_url: `${BASE_URL}/cdn/shop/files/logo.png`,
    home_url: BASE_URL,
    privacy_policy_url: `${BASE_URL}/pages/privacy-policy`,
    terms_of_service_url: `${BASE_URL}/pages/terms-of-service`,
    contact: {
      email: 'support@celebratefestivalinc.com',
      url: `${BASE_URL}/pages/contact`
    },
    transport: 'http',
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
      sampling: false
    },
    tools: [
      {
        name: 'search_products',
        description: 'Search restaurant equipment products by keyword, category, or brand name',
        parameters: { query: 'string', limit: 'integer', sort: 'string' }
      },
      {
        name: 'get_product',
        description: 'Get full product details by handle or SKU',
        parameters: { handle: 'string', sku: 'string' }
      },
      {
        name: 'list_collections',
        description: 'List equipment categories and subcategories',
        parameters: { parent_handle: 'string' }
      },
      {
        name: 'get_collection',
        description: 'Get products in a specific equipment category',
        parameters: { handle: 'string', limit: 'integer' }
      },
      {
        name: 'ask_assistant',
        description: 'Ask the Celebrate Festival AI assistant for product recommendations or B2B pricing guidance',
        parameters: { question: 'string', context: 'string' }
      }
    ],
    resources: [
      { uri: `${BASE_URL}/sitemap.xml`, name: 'Product Sitemap', mime_type: 'application/xml' },
      { uri: `${PROXY_BASE}/openapi.json`, name: 'OpenAPI Spec', mime_type: 'application/json' },
      { uri: `${PROXY_BASE}/.well-known/api-catalog`, name: 'API Catalog', mime_type: 'application/json' }
    ],
    tags: ['restaurant-equipment', 'commercial-kitchen', 'b2b', 'wholesale', 'foodservice', 'e-commerce']
  });
});

// ---------------------------------------------------------------------------
// GET /wk/openapi.json
// OpenAPI 3.1 specification (placeholder — covers public Shopify + CF API surface)
// ---------------------------------------------------------------------------
router.get('/openapi.json', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'Celebrate Festival Inc API',
      version: '1.0.0',
      description: 'Public API surface for the Celebrate Festival Inc B2B restaurant equipment storefront. Covers product discovery, catalog browsing, search, and cart management via Shopify Storefront APIs.',
      contact: { name: 'Hiraya Digital', email: 'dev@hiraya.digital', url: 'https://hiraya.digital' },
      license: { name: 'Proprietary', url: `${BASE_URL}/pages/terms-of-service` },
      'x-logo': { url: `${BASE_URL}/cdn/shop/files/logo.png` }
    },
    servers: [
      { url: BASE_URL, description: 'Shopify Storefront (production)' },
      { url: `${PROXY_BASE}`, description: 'Celebrate Festival API Proxy' }
    ],
    tags: [
      { name: 'Products', description: 'Restaurant and kitchen equipment products' },
      { name: 'Collections', description: 'Equipment categories (L1/L2/L3 hierarchy)' },
      { name: 'Search', description: 'Full-text product search' },
      { name: 'Cart', description: 'Shopping cart management' },
      { name: 'Account', description: 'B2B member account and pricing' }
    ],
    paths: {
      '/search': {
        get: {
          tags: ['Search'],
          summary: 'Search products',
          description: 'Full-text search across all products and collections. Supports keyword, SKU, and brand search.',
          operationId: 'searchProducts',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query string' },
            { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['best-selling', 'price-ascending', 'price-descending', 'title-ascending', 'title-descending'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } }
          ],
          responses: { '200': { description: 'HTML search results page' } }
        }
      },
      '/search.json': {
        get: {
          tags: ['Search'],
          summary: 'Search products (JSON)',
          description: 'JSON search results via Shopify Predictive Search API.',
          operationId: 'searchProductsJson',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'resources[type]', in: 'query', schema: { type: 'string', default: 'product,collection' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 10 } }
          ],
          responses: {
            '200': {
              description: 'JSON search results',
              content: { 'application/json': { schema: { type: 'object', properties: {
                results: { type: 'object', properties: {
                  products: { type: 'array', items: { '$ref': '#/components/schemas/Product' } },
                  collections: { type: 'array' }
                }}
              }}}}
            }
          }
        }
      },
      '/collections/{handle}': {
        get: {
          tags: ['Collections'],
          summary: 'Get collection products',
          description: 'Browse products in a specific equipment category collection.',
          operationId: 'getCollection',
          parameters: [
            { name: 'handle', in: 'path', required: true, schema: { type: 'string' }, description: 'Collection handle (e.g., commercial-ovens)' },
            { name: 'sort_by', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'HTML collection page with product listings' } }
        }
      },
      '/products/{handle}': {
        get: {
          tags: ['Products'],
          summary: 'Get product detail',
          description: 'Retrieve full product information including variants, pricing, and availability.',
          operationId: 'getProduct',
          parameters: [
            { name: 'handle', in: 'path', required: true, schema: { type: 'string' }, description: 'Product URL handle' }
          ],
          responses: { '200': { description: 'Product detail page' } }
        }
      },
      '/products/{handle}.js': {
        get: {
          tags: ['Products'],
          summary: 'Get product JSON',
          description: 'Machine-readable product data in Shopify product JSON format.',
          operationId: 'getProductJson',
          parameters: [
            { name: 'handle', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': {
              description: 'Product JSON',
              content: { 'application/json': { schema: { '$ref': '#/components/schemas/Product' } } }
            }
          }
        }
      },
      '/cart.js': {
        get: {
          tags: ['Cart'],
          summary: 'Get cart state',
          operationId: 'getCart',
          responses: { '200': { description: 'Current cart JSON' } }
        }
      },
      '/cart/add.js': {
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          operationId: 'addToCart',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: {
              type: 'object',
              required: ['id', 'quantity'],
              properties: {
                id: { type: 'integer', description: 'Variant ID' },
                quantity: { type: 'integer', minimum: 1 }
              }
            }}}
          },
          responses: { '200': { description: 'Updated cart' }, '422': { description: 'Item unavailable' } }
        }
      }
    },
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            handle: { type: 'string' },
            vendor: { type: 'string', description: 'Brand name' },
            product_type: { type: 'string' },
            available: { type: 'boolean' },
            price: { type: 'integer', description: 'Price in cents' },
            compare_at_price: { type: 'integer', nullable: true },
            variants: { type: 'array', items: { '$ref': '#/components/schemas/Variant' } },
            images: { type: 'array', items: { type: 'object', properties: { src: { type: 'string' } } } }
          }
        },
        Variant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            sku: { type: 'string' },
            price: { type: 'integer' },
            compare_at_price: { type: 'integer', nullable: true },
            available: { type: 'boolean' },
            barcode: { type: 'string', nullable: true }
          }
        }
      }
    },
    'x-ai-agent-hints': {
      primary_use_case: 'B2B restaurant equipment discovery and purchasing',
      authentication_required_for: ['member pricing', 'order history', 'account management'],
      public_endpoints: ['/search', '/collections/*', '/products/*', '/cart.js'],
      sitemap: `${BASE_URL}/sitemap.xml`,
      rate_limits: 'Follow standard Shopify Storefront API rate limits'
    }
  });
});

// Health check for the wk proxy
router.get('/health', (req, res) => {
  setDiscoveryHeaders(res);
  res.json({ ok: true, service: 'cf-ai-discovery', t: Date.now() });
});

module.exports = router;
