// src/services/pacienteService.js
// Mock simple con "base de datos" en memoria para desarrollo.

const _db = new Map([
  // paciente de ejemplo pre-existente
  ['75767879', { 
    CNRODNI: '75767879', 
    CAPEPAT: 'ROSAS', 
    CAPEMAT: 'GUEVARA', 
    CNOMBRE: 'VICTOR JOSE', 
    CNROCEL: '951957852',
    CSEXO: 'M',
    DNACIMI: '1990-05-15',
    CDNIEST: '75767879'
  }]
]);

// BUSCAR
export async function buscar(paData) {
  await delay(250);
  const dni = paData && paData.CNRODNI ? String(paData.CNRODNI) : '';

  if (!dni) return { ERROR: 'DNI NO EXISTE' };

  // Si ya fue registrado en esta sesión, retornar sus datos reales
  if (_db.has(dni)) {
    const p = _db.get(dni);
    return {
      CNRODNI: p.CNRODNI,
      CNUEVO: 'N',
      CAPEPAT: p.CAPEPAT,
      CAPEMAT: p.CAPEMAT,
      CNOMBRE: p.CNOMBRE,
      CNROCEL: p.CNROCEL || '',
      CSEXO: p.CSEXO || 'M',
      DNACIMI: p.DNACIMI || '',
      CDNIEST: p.CDNIEST || p.CNRODNI
    };
  }

  // Simulación: si termina en '1' -> paciente nuevo
  if (dni.endsWith('1')) {
    return { 
      CNRODNI: dni, 
      CNUEVO: 'S', 
      CAPEPAT: '', 
      CAPEMAT: '', 
      CNOMBRE: '', 
      CNROCEL: '',
      CSEXO: 'M',
      DNACIMI: '',
      CDNIEST: ''
    };
  }

  // Simulación: devolver datos ficticios si no está en DB
  return {
    CNRODNI: dni,
    CNUEVO: 'N',
    CAPEPAT: 'ALOSILLA',
    CAPEMAT: 'MORENO SANCHEZ',
    CNOMBRE: 'LLIGUERMO',
    CNROCEL: '999999999',
    CSEXO: 'M',
    DNACIMI: '2000-07-07',
    CDNIEST: '70244827'
  };
}

// REGISTRAR
export async function registrar(paData) {
  await delay(250);
  const dni = paData && paData.CNRODNI ? String(paData.CNRODNI) : '';
  if (!dni) return { ERROR: 'DNI NO EXISTE' };

  // Validar campos requeridos
  if (!paData.CAPEPAT || !paData.CAPEMAT || !paData.CNOMBRE) {
    return { ERROR: 'Error en llenado de campos requeridos' };
  }

  const cel = paData.CNROCEL || '';

  // Guardamos en "DB" en memoria con todos los campos
  _db.set(dni, { 
    CNRODNI: dni, 
    CAPEPAT: paData.CAPEPAT,
    CAPEMAT: paData.CAPEMAT,
    CNOMBRE: paData.CNOMBRE,
    CNROCEL: cel,
    CSEXO: paData.CSEXO || 'M',
    DNACIMI: paData.DNACIMI || '',
    CDNIEST: paData.CDNIEST || dni
  });

  return { OK: 'OK' };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
