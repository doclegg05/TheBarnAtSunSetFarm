# Google Calendar Setup Guide

To automatically display booked dates on your website, follow these steps to connect your Google Calendar.

## 1. Get an API Key

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new Event (e.g., "Sunset Farm Website").
3.  In the search bar, type **"Google Calendar API"** and select it.
4.  Click **Enable**.
5.  Go to **Credentials** (in the sidebar).
6.  Click **Create Credentials** -> **API Key**.
7.  Copy this key. This is your `VITE_GOOGLE_API_KEY`.

## 2. Get Your Calendar ID

1.  Open [Google Calendar](https://calendar.google.com/) on your computer.
2.  Find the calendar you want to use (e.g., "Sunset Farm Bookings") on the left sidebar.
3.  Click the three dots (`...`) next to it -> **Settings and sharing**.
4.  Scroll down to **Access permissions for events**.
5.  Check the box **"Make available to public"**.
    - _Note: Select "See all event details" if you want to be safe, or "See only free/busy (hide details)" if you prefer privacy._
6.  Scroll down to the **Integrate calendar** section.
7.  Copy the **Calendar ID**. It usually looks like `example@group.calendar.google.com`. This is your `VITE_GOOGLE_CALENDAR_ID`.

## 3. Update the Website Code

1.  Open the file `hooks/useGoogleCalendar.ts`.
2.  Replace the placeholder text with your keys (or ideally, create a `.env` file):

```typescript
const GOOGLE_API_KEY = "PASTE_YOUR_API_KEY_HERE";
const GOOGLE_CALENDAR_ID = "PASTE_YOUR_CALENDAR_ID_HERE";
```

_Note: For better security, creating a `.env` file in the root folder is recommended:_

```
VITE_GOOGLE_API_KEY=AIzaSyAjbJLMQveUnc-U7i147J1Zb9YFoAh_9aw
VITE_GOOGLE_CALENDAR_ID=52a0469a73b4b4a5408374ad0608546d2f0ed6cb0dd69c3a0c72add874a2e3a4@group.calendar.google.com
```
