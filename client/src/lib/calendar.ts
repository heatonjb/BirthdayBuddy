interface CalendarEvent {
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location?: string;
}

export function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Birthday RSVP//EN
BEGIN:VEVENT
UID:${Math.random().toString(36).substring(2)}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.summary}
DESCRIPTION:${event.description}
${event.location ? `LOCATION:${event.location}` : ""}
END:VEVENT
END:VCALENDAR`;
}
