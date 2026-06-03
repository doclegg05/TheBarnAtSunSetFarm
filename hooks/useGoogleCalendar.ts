import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// These are standard Google Calendar API keys.
// Make sure VITE_GOOGLE_API_KEY and VITE_GOOGLE_CALENDAR_ID are set in .env
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || '';
const IS_CONFIGURED = Boolean(API_KEY && CALENDAR_ID);

interface GoogleCalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  status: string;
}

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

        const dates: Set<string> = new Set();

        events.forEach((event) => {
          // Only count confirmed events
          if (event.status === 'confirmed') {
            const start = event.start.date || event.start.dateTime;
            const end = event.end.date || event.end.dateTime;

            if (start && end) {
              const startDate = new Date(start);
              const endDate = new Date(end);

              // Loop through each day of the event
              // Note: handling 'all day' events correctly where end date is exclusive
              const current = new Date(startDate);
              while (current < endDate) {
                // If it's a specific time event (dateTime), endDate might be same day.
                // If it's all day (date), endDate is next day midnight.
                // We just mark the 'current' day as busy.
                dates.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
              }
            }
          }
        });

        setBookedDates(Array.from(dates));
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
