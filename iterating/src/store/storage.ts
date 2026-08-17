import { Platform } from 'react-native';

/**
 * Frontend-only persistence. On web this is localStorage; anywhere else it's a
 * memory shim so the app still runs. Swap this file for the API client when a
 * backend exists — nothing else reaches for storage.
 */
const KEY = 'willo.state.v2';

const memory = new Map<string, string>();

export function load<T>(): T | null {
  try {
    const raw =
      Platform.OS === 'web' && typeof localStorage !== 'undefined'
        ? localStorage.getItem(KEY)
        : memory.get(KEY) ?? null;
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save(state: unknown) {
  try {
    const raw = JSON.stringify(state);
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') localStorage.setItem(KEY, raw);
    else memory.set(KEY, raw);
  } catch {
    /* storage full or unavailable — the session still works, it just won't persist */
  }
}

export function clear() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  memory.delete(KEY);
}
