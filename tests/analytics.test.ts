import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  initAnalytics,
  isAnalyticsEnabled,
  trackEvent,
  trackOutboundClick,
} from '../lib/analytics';

const ID = 'G-TEST123';
const gtagScripts = () =>
  document.head.querySelectorAll('script[src*="googletagmanager.com/gtag"]');

afterEach(() => {
  delete window.gtag;
  delete window.dataLayer;
  gtagScripts().forEach((script) => script.remove());
});

describe('isAnalyticsEnabled', () => {
  it('stays off without a measurement ID', () => {
    expect(isAnalyticsEnabled('', 'thebarnatsunsetfarm.com')).toBe(false);
  });

  it('stays off on deploy previews and local dev', () => {
    expect(
      isAnalyticsEnabled(
        ID,
        'deploy-preview-26--thebarnatsunsetfarm.netlify.app'
      )
    ).toBe(false);
    expect(isAnalyticsEnabled(ID, 'localhost')).toBe(false);
  });

  it('turns on for the live domain, with or without www', () => {
    expect(isAnalyticsEnabled(ID, 'thebarnatsunsetfarm.com')).toBe(true);
    expect(isAnalyticsEnabled(ID, 'www.thebarnatsunsetfarm.com')).toBe(true);
  });
});

describe('initAnalytics', () => {
  it('loads nothing when analytics is off', () => {
    initAnalytics(ID, 'localhost');
    expect(window.gtag).toBeUndefined();
    expect(gtagScripts()).toHaveLength(0);
  });

  it('loads gtag.js once on the live site and configures the property', () => {
    initAnalytics(ID, 'thebarnatsunsetfarm.com');
    initAnalytics(ID, 'thebarnatsunsetfarm.com');

    const scripts = gtagScripts();
    expect(scripts).toHaveLength(1);
    expect((scripts[0] as HTMLScriptElement).src).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${ID}`
    );

    // gtag.js only reads native Arguments objects off the dataLayer.
    const calls = (window.dataLayer ?? []) as IArguments[];
    expect(calls).toHaveLength(2);
    expect(Object.prototype.toString.call(calls[0])).toBe('[object Arguments]');
    expect(Array.from(calls[0])[0]).toBe('js');
    expect(Array.from(calls[1])).toEqual(['config', ID]);
  });
});

describe('event helpers', () => {
  it('do nothing when analytics is not loaded', () => {
    expect(() => trackEvent('generate_lead')).not.toThrow();
  });

  it('send events through gtag when it is loaded', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackEvent('generate_lead', { heard_about: 'Google Maps' });

    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      heard_about: 'Google Maps',
    });
  });

  it('report outbound clicks in the shape of GA4 enhanced measurement', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackOutboundClick('https://www.theknot.com/marketplace/some-venue');

    expect(gtag).toHaveBeenCalledWith('event', 'click', {
      link_url: 'https://www.theknot.com/marketplace/some-venue',
      link_domain: 'www.theknot.com',
      outbound: true,
    });
  });
});
