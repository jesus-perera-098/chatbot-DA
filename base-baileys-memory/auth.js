const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credenciales', 'credenciales.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Cargar token si existe
  try {
    const token = fs.readFileSync(TOKEN_PATH, 'utf8');
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    // Aquí deberías generar la URL de autorización y pedir al usuario que la visite para obtener un código
    console.log('No se encontró token, se debe generar uno con URL de autorización.');
    // Puedes implementar aquí el flujo para obtener token y guardarlo
    throw new Error('Token no encontrado. Genera token primero.');
  }
}

module.exports = { authorize, SCOPES };
