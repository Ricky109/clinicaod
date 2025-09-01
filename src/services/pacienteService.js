// BUSCAR
export async function buscar(paData) {
  await delay(250)
  // Si termina en 1 => nuevo; otro => existe
  const dni = paData.CNRODNI || ''
  if (!dni) return { ERROR: 'DNI NO EXISTE' }
  if (dni.endsWith('1')) return { CNRODNI: dni, CNUEVO: 'S' }
  return { CNRODNI: dni, CNUEVO: 'N', CNOMBRE: 'ROSAS/GUEVARA/VICTOR JOSE', CNROCEL: '951957852' }
}

// REGISTRAR
export async function registrar(paData) {
  await delay(250)
  if (!paData.CNRODNI) return { ERROR: 'DNI NO EXISTE' }
  return { OK: 'OK' }
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
