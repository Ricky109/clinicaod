import tratamientos from '../data/tratamientos.json'

export async function buscarArticulo({ CCODART }) {
  await delay(200)
  const found = tratamientos.find(t => t.CCODART === CCODART)
  if (!found) return { ERROR: 'ERROR 01' }
  return found
}

export async function registrarConsumo(paData) {
  await delay(300)
  const monto = paData.DATOS.reduce((s, i) => s + i.NPRECIO * i.NCANTID, 0)
  const CNROPAG = Math.floor(Math.random()*9e9).toString().padStart(10,'0')
  return { CNROPAG, NMONTO: Number(monto.toFixed(2)) }
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
