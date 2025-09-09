import { sha512 } from 'js-sha512';

const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos';

export async function login(paData) {

  const hashedPassword = sha512(paData.CCLAVE);
  
  const requestBody = {
    ID: 'LOGCOD',
    CNRODOC: paData.CNRODNI,
    CVERSION: '2.0',
    CCLAVE: hashedPassword
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return { ERROR: 'Error de conexión con el servidor' };
    }

    const data = await response.json();
    
 
    if (data.ERROR) {
      return { ERROR: data.ERROR };
    }

    // Guardar TODA la respuesta de la API, incluyendo CDNIALU
    console.log('Respuesta completa de la API de login:', data);
    
    return data; // Devolver toda la respuesta sin filtrar

  } catch (error) {
    return { ERROR: 'DNI NO EXISTE' }; 
  }
}