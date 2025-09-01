// VERIFICAR PAGO
let pagosConfirmados = new Set()

export async function verificar(paData) {
  await delay(500)
  const id = paData.CNROPAG
  if (pagosConfirmados.has(id)) return { OK: 'OK' }
  // 50% de probabilidad de estar pagado en refresco
  if (Math.random() > 0.5) { pagosConfirmados.add(id); return { OK: 'OK' } }
  return { ERROR: 'ERROR 9' }
}

export async function historial(dniEst) {
  await delay(200)
  // Mock
  return [
    { paciente: 'VICTOR JOSE', codigo: '1058423102', monto: 65.00, estado: 'PAGADO' },
    { paciente: 'ANA MARIA', codigo: '1058423103', monto: 30.00, estado: 'PENDIENTE' }
  ]
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
