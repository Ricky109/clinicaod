// VERIFICAR PAGO - API Real
export async function verificar(paData) {
  const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'
  
  try {
    const request = {
      "ID": "COD1022", // API para verificar estado de pago
      "CNROPAG": paData.CNROPAG
    }
    
    console.log('Verificando pago con:', request)
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error('Error de conexión con el servidor')
    }

    const data = await response.json()
    
    if (data.ERROR) {
      throw new Error(data.ERROR)
    }

    console.log('Respuesta de verificación de pago:', data)
    
    // La API devuelve el estado actual del pago
    return {
      OK: data.CESTADO === 'C' ? 'OK' : 'PENDIENTE',
      ESTADO: data.CESTADO,
      DESCRIPCION: data.CDESEST
    }
    
  } catch (error) {
    console.error('Error verificando pago:', error)
    throw error
  }
}

// HISTORIAL DE PACIENTES ATENDIDOS - API COD1021
export async function historialPacientesAtendidos(codigoEstudiante, fecha = null) {
  const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'
  
  try {
    // La API COD1021 busca por el DNI del estudiante que generó los pagos
    // No por el DNI del paciente atendido
    // Usar fecha proporcionada o fecha actual
    const fechaFormateada = fecha || new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    
    const request = {
      "ID": "COD1021",
      "CNRODNI": codigoEstudiante, // DNI del estudiante logueado
      "DFECHA": fechaFormateada // Fecha proporcionada o actual
    }
    
    console.log('Llamando API COD1021 con:', request)
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error('Error de conexión con el servidor')
    }

    const data = await response.json()
    
    if (data.ERROR) {
      throw new Error(data.ERROR)
    }

    console.log('Respuesta de API COD1021:', data)
    
    // Transformar los datos de la API al formato esperado por el componente
    return data.map(item => ({
      paciente: item.CNOMBRE,
      dni: item.CNRODNI,
      codigo: item.CNROPAG,
      monto: item.NMONTO,
      estado: item.CESTADO,
      estadoDesc: item.CDESEST,
      fecha: item.TREGIS
    }))
    
  } catch (error) {
    console.error('Error en historialPacientesAtendidos:', error)
    throw error
  }
}

// Función legacy mantenida para compatibilidad
export async function historial(codigoEstudiante) {
  return await historialPacientesAtendidos(codigoEstudiante)
}

function delay(ms){ return new Promise(r => setTimeout(r, ms)) }
