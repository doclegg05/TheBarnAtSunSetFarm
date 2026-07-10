import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// The hook reads import.meta.env at module load, so each test stubs the env
// first and then dynamically imports a fresh copy of the module.
const loadHook = async () => {
  const mod = await import('../hooks/useGoogleCalendar');
  return mod.useGoogleCalendar;
};

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useGoogleCalendar', () => {
  it('reports unconfigured and never fetches when env keys are missing', async () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', '');
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const useGoogleCalendar = await loadHook();
    const { result } = renderHook(() => useGoogleCalendar());

    expect(result.current.isConfigured).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.bookedDates).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('expands fetched confirmed events into booked dates', async () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key');
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                start: { date: '2027-03-05' },
                end: { date: '2027-03-06' },
                status: 'confirmed',
              },
              {
                start: { date: '2027-03-08' },
                end: { date: '2027-03-09' },
                status: 'cancelled',
              },
            ],
          }),
      })
    );

    const useGoogleCalendar = await loadHook();
    const { result } = renderHook(() => useGoogleCalendar());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookedDates).toEqual(['2027-03-05']);
    expect(result.current.error).toBeNull();
  });

  it('sets a user-facing error when the API responds non-ok', async () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key');
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const useGoogleCalendar = await loadHook();
    const { result } = renderHook(() => useGoogleCalendar());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load availability.');
    expect(result.current.bookedDates).toEqual([]);
  });

  it('sets a user-facing error when the network request throws', async () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key');
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down'))
    );

    const useGoogleCalendar = await loadHook();
    const { result } = renderHook(() => useGoogleCalendar());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load availability.');
  });

  it('treats a response with no items as zero booked dates', async () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key');
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const useGoogleCalendar = await loadHook();
    const { result } = renderHook(() => useGoogleCalendar());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookedDates).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
