import { useState, useEffect } from 'react';
import {
  GoogleCalendarEvent,
  expandEventsToBookedDates,
} from '../lib/bookingDates';

// --- CONFIGURATION ---
// These are standard Google Calendar API keys.
// Make sure VITE_GOOGLE_API_KEY and VITE_GOOGLE_CALENDAR_ID are set in .env
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || '';
const IS_CONFIGURED = Boolean(API_KEY && CALENDAR_ID);

export const useGoogleCalendar = () => {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(IS_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no configuration is present, return (allows usage of hardcoded fallback)
    if (!IS_CONFIGURED) {
      console.warn('Google Calendar API Key or ID missing.');
      return;
    }

    const fetchEvents = async () => {
      try {
        // Fetch events from now until 2 years in the future
        const now = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=2500`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }

        const data = await response.json();
        const events: GoogleCalendarEvent[] = data.items || [];

        setBookedDates(expandEventsToBookedDates(events));
      } catch (err) {
        console.error('Error fetching Google Calendar events:', err);
        setError('Could not load availability.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return {
    bookedDates,
    loading,
    error,
    isConfigured: IS_CONFIGURED,
  };
};
