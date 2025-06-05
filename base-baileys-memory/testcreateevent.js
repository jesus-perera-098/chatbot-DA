const { createEvent } = require('./calendar');

(async () => {
  try {
    const event = await createEvent({
      summary: 'Evento de prueba',
      description: 'Este evento fue creado desde Node.js usando la API de Google Calendar',
      startDateTime: '2025-06-05T15:00:00-05:00', // Ajusta la fecha y hora a la que quieras
      endDateTime: '2025-06-05T16:00:00-05:00',
    });
    console.log('Evento creado con éxito:', event.htmlLink);
  } catch (error) {
    console.error('Error creando evento:', error);
  }
})();
