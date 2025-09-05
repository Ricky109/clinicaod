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

export async function historial(codigoEstudiante) {
  await delay(200)
  // Mock con datos de ejemplo para diferentes estudiantes
  const historialCompleto = [
    { paciente: 'VICTOR JOSE', codigo: '1058423102', monto: 65.00, estado: 'PAGADO', codigoEstudiante: '75767879' },
    { paciente: 'ANA MARIA', codigo: '1058423103', monto: 30.00, estado: 'PENDIENTE', codigoEstudiante: '1234567890' },
    { paciente: 'CARLOS LOPEZ', codigo: '1058423104', monto: 150.00, estado: 'PAGADO', codigoEstudiante: '1234567890' },
    { paciente: 'MARIA GONZALEZ', codigo: '1058423105', monto: 80.00, estado: 'ANULADO', codigoEstudiante: '9876543210' },
    { paciente: 'VICTOR JOSE', codigo: '1058423106', monto: 200.00, estado: 'PENDIENTE', codigoEstudiante: '75767879' }
  ]
  
  // Filtrar por código de estudiante
  return historialCompleto.filter(pago => pago.codigoEstudiante === codigoEstudiante)
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
