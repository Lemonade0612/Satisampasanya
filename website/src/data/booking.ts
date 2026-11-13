// Example availability for the booking widget.
// TODO: replace with a real Calendly embed (https://calendly.com/<account>/<event>)
// and delete this file + components/BookingWidget.tsx.
export const BOOKING_YEAR = 2026;
export const BOOKING_MONTH = 10; // 0-based → November

/** ISO date → available start times (24h, Indochina Time). */
export const AVAILABILITY: Record<string, string[]> = {
  "2026-11-18": ["09:00", "10:30", "14:00"],
  "2026-11-20": ["09:00", "13:30", "15:00", "16:30"],
  "2026-11-24": ["10:00", "14:00"],
  "2026-11-26": ["09:30", "11:00", "15:30"],
};
