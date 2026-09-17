import {
  EMPTY_STATE,
  STORAGE_KEY,
  parseStoredState,
  shopReducer,
  type ShopAction,
  type ShopState,
} from "./store";

/**
 * Externer Store für Warenkorb/Wunschliste, gedacht für `useSyncExternalStore`.
 * - Server-Snapshot ist immer leer (SSR-kompatibel, kein Hydration-Mismatch).
 * - Beim ersten Client-Zugriff wird aus localStorage geladen.
 * - Änderungen werden persistiert und über das `storage`-Event tab-übergreifend synchronisiert.
 */

let state: ShopState = EMPTY_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    /* Storage nicht verfügbar (Privatmodus o. ä.) */
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignorieren */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  state = parseStoredState(event.newValue);
  emit();
}

export function subscribe(listener: () => void): () => void {
  loadOnce();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): ShopState {
  loadOnce();
  return state;
}

export function getServerSnapshot(): ShopState {
  return EMPTY_STATE;
}

/** true, sobald der Client aus dem Storage geladen hat (false beim SSR/Hydration-Render). */
export function getHydrated(): boolean {
  loadOnce();
  return loaded;
}

export function getServerHydrated(): boolean {
  return false;
}

export function dispatch(action: ShopAction): void {
  loadOnce();
  state = shopReducer(state, action);
  persist();
  emit();
}
