type Entry = { failures: number[]; blockedUntil?: number };

const entries = new Map<string, Entry>();
const WINDOW = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function isLoginLimited(key: string) {
  const entry = entries.get(key);
  if (!entry) return false;
  const now = Date.now();
  if (entry.blockedUntil && entry.blockedUntil > now) return true;
  entry.failures = entry.failures.filter((time) => now - time < WINDOW);
  if (entry.failures.length >= MAX_FAILURES) {
    entry.blockedUntil = now + WINDOW;
    return true;
  }
  return false;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const entry = entries.get(key) ?? { failures: [] };
  entry.failures = entry.failures.filter((time) => now - time < WINDOW);
  entry.failures.push(now);
  if (entry.failures.length >= MAX_FAILURES) entry.blockedUntil = now + WINDOW;
  entries.set(key, entry);
}

export function clearLoginFailures(key: string) {
  entries.delete(key);
}
