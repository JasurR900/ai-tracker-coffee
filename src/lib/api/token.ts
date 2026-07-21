'use client';

const STORAGE_KEY = 'calai:jwt';

declare global {
  interface Window {
    __COFFEE_JWT__?: string;
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

type TokenListener = (token: string | null) => void;

const listeners = new Set<TokenListener>();
let cached: string | null | undefined;
let listening = false;

function readInjected(): string | null {
  if (typeof window === 'undefined') return null;
  const injected = window.__COFFEE_JWT__;
  if (typeof injected === 'string' && injected.trim()) return injected.trim();
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored?.trim() || null;
  } catch {
    return null;
  }
}

function writeCache(token: string | null) {
  cached = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
  if (token) window.__COFFEE_JWT__ = token;
}

function ensureMessageListener() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('message', (event) => {
    let data: unknown = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }
    if (!data || typeof data !== 'object') return;
    const msg = data as { type?: string; token?: string };
    if (msg.type === 'AUTH_TOKEN' && typeof msg.token === 'string' && msg.token.trim()) {
      setToken(msg.token.trim());
    }
  });
}

/** Current JWT from WebView injection or sessionStorage. */
export function getToken(): string | null {
  ensureMessageListener();
  if (cached !== undefined) return cached;
  const token = readInjected();
  cached = token;
  return token;
}

export function setToken(token: string | null) {
  ensureMessageListener();
  writeCache(token);
  listeners.forEach((cb) => cb(token));
}

/** Wait until a token is available (injected or already cached), with timeout. */
export function waitForToken(timeoutMs = 4000): Promise<string | null> {
  ensureMessageListener();
  const existing = getToken();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const started = Date.now();
    const poll = window.setInterval(() => {
      const token = getToken();
      if (token) {
        window.clearInterval(poll);
        window.clearTimeout(timer);
        unsub();
        resolve(token);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(poll);
        window.clearTimeout(timer);
        unsub();
        resolve(null);
      }
    }, 50);

    const unsub = onTokenChange((token) => {
      if (token) {
        window.clearInterval(poll);
        window.clearTimeout(timer);
        unsub();
        resolve(token);
      }
    });

    const timer = window.setTimeout(() => {
      window.clearInterval(poll);
      unsub();
      resolve(getToken());
    }, timeoutMs);
  });
}

export function onTokenChange(cb: TokenListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Notify the native WebView that the JWT was rejected (401). */
export function notifyTokenExpired() {
  if (typeof window === 'undefined') return;
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'TOKEN_EXPIRED' }));
  } catch {
    // ignore
  }
}
