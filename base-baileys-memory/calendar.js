const { google } = require('googleapis');
const { authorize } = require('./auth');

async function getCalendar() {
  const authClient = await authorize();
  const calendar = google.calendar({ version: 'v3', auth: authClient });
  return calendar;
}

async function getAvailability(date) {
  const calendar = await getCalendar();  // <--- CORRECCIÓN
  const calendarId = 'primary';

  const timeZone = 'America/Mexico_City';
  const timeMin = new Date(`${date}T09:00:00-05:00`).toISOString();
  const timeMax = new Date(`${date}T14:00:00-05:00`).toISOString();

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;

  // Generar slots de 1 hora entre 09:00 y 14:00
  const possibleSlots = [9, 10, 11, 12, 13];
  const availableSlots = [];

  for (const hour of possibleSlots) {
    const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00-05:00`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

    const conflict = events.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return slotStart < eventEnd && eventStart < slotEnd; // hay traslape
    });

    if (!conflict) {
      availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  return availableSlots;
}

async function createEvent({ summary, description, date, time }) {
  const calendar = await getCalendar(); // <--- CORRECCIÓN
  const calendarId = 'primary';

  const startDateTime = new Date(`${date}T${time}:00-05:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hora después

  const event = {
    summary,
    description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Mexico_City',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Mexico_City',
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    resource: event,
  });

  return response.data.htmlLink; // link de confirmación
}

module.exports = { getAvailability, createEvent };
