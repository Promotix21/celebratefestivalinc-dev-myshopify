const BLOCKED_PATTERNS = [
  /ignore (all |previous |prior )?(instructions|prompts?)/i,
  /system prompt/i,
  /you are now/i,
  /pretend (to be|you are)/i,
  /disregard (all |previous )?/i,
  /reveal your (instructions|prompt|system)/i,
  /<\s*script/i,
  /\bjailbreak\b/i,
  /\bDAN\b/,
];

const OFF_TOPIC = [
  /\b(porn|sex|nude|xxx|adult)\b/i,
  /\b(hack|crack|pirate|warez)\b/i,
  /\b(politics|election|vote|republican|democrat)\b/i,
  /\b(religion|god|allah|jesus|hindu|muslim|christian)\b/i,
];

function sanitize(input) {
  if (!input || typeof input !== 'string') return '';
  // Allow up to 2000 chars so Pro Mode can paste ~30 comma-separated SKUs.
  let s = input.trim().slice(0, 2000);
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return s;
}

function isBlocked(input) {
  for (const r of BLOCKED_PATTERNS) if (r.test(input)) return { blocked: true, reason: 'injection' };
  for (const r of OFF_TOPIC) if (r.test(input)) return { blocked: true, reason: 'off_topic' };
  return { blocked: false };
}

module.exports = { sanitize, isBlocked };
