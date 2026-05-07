const INTENT_PATTERNS = {
  product_search: [
    /\b(show|find|search|looking for|need|want|buy|price|cost)\b/i,
    /\b(oven|fryer|refrigerator|freezer|grill|mixer|blender|tandoor|dishwasher|steamer|cooker|equipment)\b/i,
  ],
  navigation: [
    /\b(where|show me|take me to|section|category|collection|browse|catalog)\b/i,
  ],
  kitchen_planning: [
    /\b(plan|setup|open|start|new restaurant|my kitchen|design|layout|cuisine|menu)\b/i,
  ],
  talk_to_expert: [
    /\b(call|book|appointment|consult|expert|talk to|speak|quote|contact)\b/i,
  ],
  greeting: [
    /^(hi|hello|hey|greetings|good (morning|afternoon|evening))\b/i,
  ],
};

function detectIntent(message) {
  const hits = {};
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    hits[intent] = patterns.filter(r => r.test(message)).length;
  }
  const best = Object.entries(hits).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'general';
}

module.exports = { detectIntent };
