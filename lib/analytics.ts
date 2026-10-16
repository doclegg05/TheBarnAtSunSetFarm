/**
 * Google Analytics 4 — see GOOGLE_ANALYTICS_SETUP.md for the owner's steps.
 *
 * Nothing loads until VITE_GA_MEASUREMENT_ID is set, and even then only on
 * the live domain: Netlify deploy previews and local dev stay silent, so test
 * inquiries never skew the owner's numbers.
 *
 * Page views (including moves between /, /gallery, /virtual-tour) come from
 * GA4's enhanced measurement "page changes based on browser history events"
 * setting, so we never send page_view by hand — that would double-count.
 */
const MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export const PRODUCTION_HOSTNAMES = [
  'thebarnatsunsetfarm.com',
  'www.thebarnatsunsetfarm.com',
];

type EventParams = Record<string, string | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isAnalyticsEnabled(
  measurementId: string = MEASUREMENT_ID,
  hostname: string = window.location.hostname
): boolean {
  return Boolean(measurementId) && PRODUCTION_HOSTNAMES.includes(hostname);
}

export function initAnalytics(
  measurementId: string = MEASUREMENT_ID,
  hostname: string = window.location.hostname
): void {
  if (!isAnalyticsEnabled(measurementId, hostname) || window.gtag) {
    return;
  }

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = function gtag() {
    // gtag.js only recognises the native `arguments` object, not an array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/** Sends a GA4 event; a no-op whenever analytics is not loaded. */
export function trackEvent(name: string, params: EventParams = {}): void {
  window.gtag?.('event', name, params);
}

/**
 * Records a click that leaves the site in the same shape as GA4's own
 * outbound-click event, so it lands in the same "Link domain" reports.
 * Needed for links opened with window.open, which GA can't see on its own.
 */
export function trackOutboundClick(url: string): void {
  trackEvent('click', {
    link_url: url,
    link_domain: new URL(url).hostname,
    outbound: true,
  });
}
