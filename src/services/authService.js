// Mock de login esquema paData
export async function login(paData) {
  // paData = { CNRODNI, CCLAVE }
  await delay(300)
  
  if (!paData.CNRODNI || !paData.CCLAVE) {
    return { ERROR: 'DNI Y CLAVE REQUERIDOS' }
  }
  
  // Generar código de estudiante único basado en el DNI
  const codigoEstudiante = paData.CNRODNI
  
  // Simular diferentes usuarios para pruebas
  const usuarios = {
    '75767879': { CNOMBRE: 'PUCHICANAS/VICTOR', CCODALU: '75767879', CUSUCOD: '*123' },
    '1234567890': { CNOMBRE: 'GARCIA/ANA MARIA', CCODALU: '1234567890', CUSUCOD: '*456' },
    '9876543210': { CNOMBRE: 'LOPEZ/CARLOS', CCODALU: '9876543210', CUSUCOD: '*789' }
  }
  
  const usuario = usuarios[paData.CNRODNI] || {
    CNOMBRE: 'USUARIO/TEST',
    CCODALU: paData.CNRODNI,
    CUSUCOD: '*000'
  }
  
  return {
    CNRODNI: paData.CNRODNI,
    CNOMBRE: usuario.CNOMBRE,
    CCODALU: usuario.CCODALU,
    CUSUCOD: usuario.CUSUCOD
  }
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
