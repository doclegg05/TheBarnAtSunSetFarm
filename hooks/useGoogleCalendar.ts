import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// Follow the instructions in GOOGLE_CALENDAR_SETUP.md to get these values.
// You can either paste them here (easier) or use a .env file (more secure).
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ""; 
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || "";

interface GoogleCalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  status: string;
}

export const useGoogleCalendar = () => {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no configuration is present, return (allows usage of hardcoded fallback)
    if (!API_KEY || !CALENDAR_ID) {
      console.warn("Google Calendar API Key or ID missing. Using hardcoded dates.");
      setLoading(false);
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

        events.forEach(event => {
          // Only count confirmed events
          if (event.status === 'confirmed') {
            const start = event.start.date || event.start.dateTime;
            const end = event.end.date || event.end.dateTime;

            if (start && end) {
              const startDate = new Date(start);
              const endDate = new Date(end);

              // Loop through each day of the event
              for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
                 // Format as YYYY-MM-DD
                 dates.add(d.toISOString().split('T')[0]);
              }
              // Note: Google Calendar "end date" is exclusive for all-day events, which this loop handles correctly.
            }
          }
        });

        setBookedDates(Array.from(dates));
      } catch (err) {
        console.error("Error fetching Google Calendar events:", err);
        setError("Could not load availability.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { bookedDates, loading, error, isConfigured: !!(API_KEY && CALENDAR_ID) };
};
