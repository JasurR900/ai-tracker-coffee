'use client';

import { isSafePaymentUrl } from '@/lib/paymentUrl';

export type NativePhotoSource = 'camera' | 'gallery';

type PhotoHandler = (dataUrl: string) => void;
type CancelHandler = () => void;

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    __COFFEE_NATIVE_CAMERA__?: boolean;
  }
}

/** True when running inside the Point Coffee React Native WebView. */
export function isNativeWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ReactNativeWebView) || Boolean(window.__COFFEE_NATIVE_CAMERA__);
}

function postToNative(payload: Record<string, unknown>) {
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
  } catch {
    // ignore
  }
}

/**
 * Ask the native app to open camera or gallery and return a JPEG data URL.
 * Falls back to rejecting if not in a WebView.
 */
export function requestNativePhoto(source: NativePhotoSource): Promise<string> {
  if (!isNativeWebView()) {
    return Promise.reject(new Error('Not in native WebView'));
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Native photo timeout'));
    }, 120_000);

    const onMessage = (event: MessageEvent) => {
      let data: unknown = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;
      const msg = data as { type?: string; dataUrl?: string; error?: string };
      if (msg.type === 'NATIVE_PHOTO' && typeof msg.dataUrl === 'string' && msg.dataUrl) {
        cleanup();
        resolve(msg.dataUrl);
      } else if (msg.type === 'NATIVE_PHOTO_CANCELLED') {
        cleanup();
        reject(new Error('cancelled'));
      } else if (msg.type === 'NATIVE_PHOTO_ERROR') {
        cleanup();
        reject(new Error(msg.error || 'Native photo failed'));
      }
    };

    // Also listen via a custom event injected by native injectJavaScript
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { type?: string; dataUrl?: string; error?: string }
        | undefined;
      if (!detail) return;
      if (detail.type === 'NATIVE_PHOTO' && detail.dataUrl) {
        cleanup();
        resolve(detail.dataUrl);
      } else if (detail.type === 'NATIVE_PHOTO_CANCELLED') {
        cleanup();
        reject(new Error('cancelled'));
      } else if (detail.type === 'NATIVE_PHOTO_ERROR') {
        cleanup();
        reject(new Error(detail.error || 'Native photo failed'));
      }
    };

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('coffeeNativePhoto', onCustom as EventListener);
    }

    window.addEventListener('message', onMessage);
    window.addEventListener('coffeeNativePhoto', onCustom as EventListener);

    postToNative({
      type: source === 'camera' ? 'REQUEST_CAMERA' : 'REQUEST_GALLERY',
    });
  });
}

/**
 * Open any external https/tg link outside the WebView (Telegram, docs, …).
 * Never use window.location — that hijacks the Cal AI WebView.
 */
export function openExternalUrl(url: string) {
  if (!url) return;
  // eslint-disable-next-line no-console
  console.log('[bridge] openExternalUrl', { url, native: isNativeWebView() });

  if (isNativeWebView()) {
    postToNative({ type: 'OPEN_EXTERNAL_URL', url });
    return;
  }
  try {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.assign(url);
  } catch {
    window.location.assign(url);
  }
}

/**
 * Open Click/Payme/Uzum outside the WebView so the pending screen stays visible.
 * Falls back to full navigation when not in the native app.
 */
export function openExternalPayment(url: string) {
  if (!url) return;
  const safe = isSafePaymentUrl(url);
  // eslint-disable-next-line no-console
  console.log('[payment] openExternalPayment', { url, safe, native: isNativeWebView() });

  if (!safe) {
    // eslint-disable-next-line no-console
    console.warn('[payment] blocked unsafe payment url', url);
    return;
  }

  // Payment URLs must not be confused with support links that contain "pointcoffee".
  openExternalUrl(url);
}

/** Subscribe to one-shot native photo for fire-and-forget UI flows. */
export function onNativePhoto(handler: PhotoHandler, onCancel?: CancelHandler): () => void {
  const onMessage = (event: MessageEvent) => {
    let data: unknown = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }
    if (!data || typeof data !== 'object') return;
    const msg = data as { type?: string; dataUrl?: string };
    if (msg.type === 'NATIVE_PHOTO' && msg.dataUrl) handler(msg.dataUrl);
    if (msg.type === 'NATIVE_PHOTO_CANCELLED') onCancel?.();
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}
