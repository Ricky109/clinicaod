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

// HISTORIAL DE PACIENTES ATENDIDOS - API COD1021
export async function historialPacientesAtendidos(codigoEstudiante) {
  await delay(300)
  
  // Simulación de llamada a API COD1021
  const request = {
    "ID": "COD1021",
    "CDNIALU": codigoEstudiante
  }
  
  console.log('Llamando API COD1021 con:', request)
  
  // Mock de respuesta de la API - usar el código del usuario logueado
  const historialCompleto = [
    { 
      codigo: '1058423102', 
      paciente: 'ALOSILLA MORENO SANCHEZ LLIGUERMO', 
      monto: 120.50, 
      estado: 'PAGADO', 
      fecha: '2024-01-15',
      codigoEstudiante: codigoEstudiante 
    },
    { 
      codigo: '1058423103', 
      paciente: 'ROSAS GUEVARA VICTOR JOSE', 
      monto: 85.00, 
      estado: 'PENDIENTE', 
      fecha: '2024-01-14',
      codigoEstudiante: codigoEstudiante 
    },
    { 
      codigo: '1058423104', 
      paciente: 'GARCIA LOPEZ MARIA ELENA', 
      monto: 200.00, 
      estado: 'PAGADO', 
      fecha: '2024-01-13',
      codigoEstudiante: codigoEstudiante 
    },
    { 
      codigo: '1058423105', 
      paciente: 'MARTINEZ RODRIGUEZ CARLOS', 
      monto: 75.50, 
      estado: 'ANULADO', 
      fecha: '2024-01-12',
      codigoEstudiante: codigoEstudiante 
    }
  ]
  
  // Filtrar por código de estudiante
  return historialCompleto.filter(pago => pago.codigoEstudiante === codigoEstudiante)
}

// Función legacy mantenida para compatibilidad
export async function historial(codigoEstudiante) {
  return await historialPacientesAtendidos(codigoEstudiante)
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
