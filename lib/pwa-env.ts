/**
 * PWA environment detection (client-only).
 * Used for iOS forced standalone and Android install prompt.
 */

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window as Window & { navigator: { standalone?: boolean } }).navigator
      .standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}
