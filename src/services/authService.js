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

  
    return { 
      CNRODNI: data.CNRODNI, 
      CNOMBRE: data.CNOMBRE, 
      CCODALU: data.CCODALU, 
      CUSUCOD: data.CUSUCOD  
    };

  } catch (error) {
    return { ERROR: 'DNI NO EXISTE' }; 
  }
}
