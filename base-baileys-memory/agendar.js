const { addKeyword } = require('@bot-whatsapp/bot');
const { getAvailability, createEvent } = require('./calendar');

const RANGO_HORARIO = {
  inicio: "09:00",
  fin: "14:00"
};

function filtrarHorariosPorRango(horarios, inicio, fin) {
  // horarios es array de strings tipo "09:00", "13:30", etc.
  return horarios.filter(h => h >= inicio && h <= fin);
}

const flowAgendar = addKeyword(['agendar', 'cita', 'agenda'])

  .addAnswer('A continuación escribe tu nombre, apellido y número telefónico para agendar tu cita. Ej.(Juan Perez, 9988457689)', { capture: true }, async (ctx, { state }) => {
    const nombre = ctx.body.trim();
    await state.update({ nombreCliente: nombre });
  })

  .addAnswer('📅 ¿Qué día deseas agendar tu cita? (Excepto sábados y domingos) (formato: YYYY-MM-DD) (Ej. 2025-06-05)', { capture: true }, async (ctx, { flowDynamic, fallBack, state }) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const inputDate = ctx.body.trim();

    if (!dateRegex.test(inputDate)) {
      return fallBack('❌ Formato inválido. Usa el formato YYYY-MM-DD (Ej. 2025-06-05)');
    }

    const [year, month, day] = inputDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 6 = sábado

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return fallBack('🚫 No es posible agendar citas en fin de semana. Por favor escoge una fecha entre lunes y viernes.');
    }

    try {
      const available = await getAvailability(inputDate);

      if (!available || available.length === 0) {
        return fallBack('😔 No hay horarios disponibles ese día. Intenta con otra fecha.');
      }

      const horariosFiltrados = filtrarHorariosPorRango(available, RANGO_HORARIO.inicio, RANGO_HORARIO.fin);

      if (horariosFiltrados.length === 0) {
        return fallBack('😔 No hay horarios disponibles dentro del horario de atención (9am-2pm). Intenta otro día.');
      }

      const horarioAsignado = horariosFiltrados[0];
      const nombreCliente = await state.get('nombreCliente');
      const summary = `Cita con ${nombreCliente}`;
      const description = 'Agendada automáticamente por el chatbot de Decorando con Adriana';

      const eventLink = await createEvent({
        summary,
        description,
        date: inputDate,
        time: horarioAsignado
      });

      return flowDynamic([
        '🎉 Tu cita ha sido agendada correctamente.',
        `📆 Día: ${inputDate}`,
        `🕒 Hora asignada: ${horarioAsignado}`,
        'Para reiniciar el asistente automático escribe "Inicio".'
      ]);

    } catch (err) {
      console.error('Error al agendar cita automáticamente:', err);
      return flowDynamic('❌ Ocurrió un error al agendar tu cita. Inténtalo más tarde.');
    }
  });


module.exports = { flowAgendar };
