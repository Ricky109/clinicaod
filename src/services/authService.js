// Mock de login usando tu esquema paData
export async function login(paData) {
  // paData = { CNRODNI, CCLAVE }
  await delay(300)
  if (paData.CNRODNI === '75767879' && paData.CCLAVE) {
    return { CNRODNI: paData.CNRODNI, CNOMBRE: 'PUCHICANAS', CCODALU: '2020123456', CUSUCOD: '*123' }
  }
  if (paData.CNRODNI) {
    return { CNRODNI: paData.CNRODNI, CNOMBRE: 'PUCHICANAS', CCODALU: '2020123456', CUSUCOD: '*123' }
  }
  return { ERROR: 'DNI NO EXISTE' }
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
