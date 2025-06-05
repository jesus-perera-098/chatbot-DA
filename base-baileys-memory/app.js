// app.js
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
require('dotenv').config();

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

const path = require('path');
const fs = require('fs');

const { flowAgendar } = require('./agendar'); // Solo flowAgendar, sin seleccionar horario

// Carga mensajes de texto
const loadMessage = (filename) => fs.readFileSync(path.join(__dirname, 'mensajes', filename), 'utf-8');

const general = loadMessage('general.txt');
const regalos = loadMessage('regalos.txt');
const eventos = loadMessage('eventos.txt');
const centrodemesa = loadMessage('centrodemesa.txt');
const bouquets = loadMessage('bouquets.txt');

// Flujos básicos para palabras clave
const flowBouquet = addKeyword(['Bouquet-03','OP3', 'OP 3','op3', 'op 3','bouquet-03', 'Bouquets-03', 'bouquets-03', 'Bouquets 03','Bouquet 03']).addAnswer(
  bouquets
).addAnswer("Para reiniciar el asistente automático escribe 'Inicio'")

const flowCentro = addKeyword(['Centro de mesa-01','OP1','op1','OP 1', 'op 1', 'centro de mesa-01','Centro de mesa 01','Centros de mesa 01']).addAnswer(
  centrodemesa
).addAnswer("Para reiniciar el asistente automático escribe 'Inicio'")

const flowEvento = addKeyword(['Evento-04', 'evento-04', 'Eventos-04', 'eventos-04', 'decoracion de eventos-04','OP4', 'op4','OP 4','op 4','Eventos 04','evento 04']).addAnswer(
  eventos
).addAnswer("Para reiniciar el asistente automático escribe 'Inicio'")

const flowRegalo = addKeyword(['Regalos-02','regalos-02','OP2','OP 2','op 2','op2','Regalos 02','Regalo 02']).addAnswer(
  regalos
).addAnswer("Para reiniciar el asistente automático escribe 'Inicio'")

const flowTrabajo = addKeyword(['Trabajo', 'trabajo']).addAnswer(
  general
);

const flowPersonal = addKeyword(['Personal', 'personal'])
  .addAnswer(
    "Gracias por especificar el motivo de tu mensaje. A continuación escríbeme tu mensaje y en breve me pondré en contacto contigo"
  )
  .addAnswer("Para reiniciar el asistente automático escribe 'Inicio'")

const flowOmitir = addKeyword(['omitir', 'Omitir'])
  .addAnswer('👌 Has salido del asistente automático. Puedes escribir libremente.')
  .addAnswer('Para reiniciar el asistente automatico escribe "Inicio"')

const flowInicio = addKeyword(['ayuda','Informacion','informacion','Información','información','Cotizar','cotizar','Precio','precio','Inicio', 'inicio','cotización','Cotización'])
  .addAnswer('¡Hola! Bienvenido a Decorando con Adriana 🎀')
  .addAnswer('Si deseas omitir el asistente automático escribe "Omitir"')
  .addAnswer('¿Tu mensaje es de tipo *Personal* o *Trabajo*?', { capture: true }, async (ctx, { gotoFlow, fallBack }) => {
    const respuesta = ctx.body.toLowerCase();

    if (respuesta.includes('personal')) {
      return gotoFlow(flowPersonal);
    } else if (respuesta.includes('trabajo')) {
      return gotoFlow(flowTrabajo);
    } else if (respuesta.includes('omitir')) {
      return gotoFlow(flowOmitir);
    } else {
      return fallBack('Por favor indica si tu mensaje es *Personal* o *Trabajo*.');
    }
  });




// Crear flujo principal con todos los flujos
const main = async () => {
  try {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
      flowInicio,
      flowPersonal,
      flowTrabajo,
      flowRegalo,
      flowEvento,
      flowCentro,
      flowBouquet,
      flowAgendar,
      flowOmitir  // Solo este flujo para agendar cita automáticamente
    ]);
    const adapterProvider = createProvider(BaileysProvider);

    await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    QRPortalWeb();
  } catch (error) {
    console.error('Error al iniciar el bot:', error);
  }
};

main();

// Manejador global para rechazos de promesas no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo de promesa no manejado:', reason);
});
