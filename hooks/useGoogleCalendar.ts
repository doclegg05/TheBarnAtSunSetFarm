import { useState, useEffect } from 'react';
import { addDays, format, parseISO, startOfDay } from 'date-fns';

// --- CONFIGURATION ---
// These are standard Google Calendar API keys.
// Make sure VITE_GOOGLE_API_KEY and VITE_GOOGLE_CALENDAR_ID are set in .env
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
            console.warn("Google Calendar API Key or ID missing.");
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
                    if (event.status !== 'confirmed') {
                        return;
                    }

                    // Dates must be computed in LOCAL time, not UTC: an evening
                    // event (e.g. 6-11pm Eastern) converted via toISOString()
                    // would mark the wrong day as booked.
                    if (event.start.date && event.end.date) {
                        // All-day event: end date is exclusive per the API.
                        let current = parseISO(event.start.date);
                        const endExclusive = parseISO(event.end.date);
                        while (current < endExclusive) {
                            dates.add(format(current, 'yyyy-MM-dd'));
                            current = addDays(current, 1);
                        }
                    } else if (event.start.dateTime && event.end.dateTime) {
                        // Timed event: mark every local day it touches.
                        // Subtract 1ms so an event ending exactly at midnight
                        // doesn't spill into the next day.
                        let current = startOfDay(new Date(event.start.dateTime));
                        const lastDay = startOfDay(new Date(new Date(event.end.dateTime).getTime() - 1));
                        while (current <= lastDay) {
                            dates.add(format(current, 'yyyy-MM-dd'));
                            current = addDays(current, 1);
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
