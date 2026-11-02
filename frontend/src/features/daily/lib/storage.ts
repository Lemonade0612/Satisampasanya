// Every read and write is guarded: private mode or blocked storage must never break the game.
export function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable, keep playing */ }
}
export const today = () => new Date().toISOString().slice(0, 10);
