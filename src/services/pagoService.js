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

// HISTORIAL DE PACIENTES ATENDIDOS - API COD1021 (ahora con rango de fechas)
export async function historialPacientesAtendidos(codigoEstudiante, fechaInicio, fechaFin) {
  const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'
  
  try {
    // Asegurar fechas válidas (fallback: usar la misma fecha si una falta)
    const hoy = new Date().toISOString().split('T')[0]
    const DINICIO = fechaInicio || fechaFin || hoy
    const DFINALI = fechaFin || fechaInicio || hoy

    const request = {
      "ID": "COD1021",
      "CNRODNI": codigoEstudiante, // DNI del estudiante logueado
      "DINICIO": DINICIO,          // Fecha inicio (YYYY-MM-DD)
      "DFINALI": DFINALI           // Fecha fin (YYYY-MM-DD)
    }
    
    console.log('Llamando API COD1021 (rango) con:', request)
    
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
      cboleta: item.CBOLETA,
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

// OBTENER NOMBRE DE BOLETA PDF - API COD1026
export async function obtenerNombreBoletaPdf(cboleta) {
  const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'
  try {
    const request = {
      "ID": "COD1026",
      "CBOLETA": cboleta
    }
    console.log('Solicitando nombre de boleta (COD1026) con:', request)
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    if (!response.ok) {
      throw new Error('Error de conexión con el servidor')
    }
    const data = await response.json()
    if (data.ERROR) {
      throw new Error(data.ERROR)
    }
    // La API devuelve un JSON con el nombre del PDF. Intentar obtenerlo.
    // Ejemplo: "20141637941-03-B055-00001009.pdf"
    const nombrePdf = data?.CBOLETA || data?.NOMBRE || data?.PDF || data?.archivo || data?.[0] || data
    if (!nombrePdf || typeof nombrePdf !== 'string') {
      throw new Error('Respuesta inválida del servicio COD1026')
    }
    return nombrePdf
  } catch (error) {
    console.error('Error en obtenerNombreBoletaPdf:', error)
    throw error
  }
}
