// Small in-memory fixed-window limiter for public endpoints. A restart resets it, which errs on the side of availability.
export function makeLimiter(max, windowMs) {
  const hits = new Map();
  return key => {
    const now = Date.now(); let entry = hits.get(key);
    if (!entry || entry.until < now) { entry = { count: 0, until: now + windowMs }; hits.set(key, entry); }
    entry.count++;
    if (hits.size > 5000) for (const [k, v] of hits) if (v.until < now) hits.delete(k);
    return entry.count <= max;
  };
}
