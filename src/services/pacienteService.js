// src/services/pacienteService.js
// Mock simple con "base de datos" en memoria para desarrollo.

const _db = new Map([
  // paciente de ejemplo pre-existente
  ['75767879', { CNRODNI: '75767879', CNOMBRE: 'ROSAS/GUEVARA/VICTOR JOSE', CNROCEL: '951957852' }]
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
      CNOMBRE: p.CNOMBRE,
      CNROCEL: p.CNROCEL || ''
    };
  }

  // Simulación: si termina en '1' -> paciente nuevo
  if (dni.endsWith('1')) {
    return { CNRODNI: dni, CNUEVO: 'S', CNOMBRE: '', CNROCEL: '' };
  }

  // Simulación: devolver datos ficticios si no está en DB
  return {
    CNRODNI: dni,
    CNUEVO: 'N',
    CNOMBRE: 'ROSAS/GUEVARA/VICTOR JOSE',
    CNROCEL: '999888777' // 👈 ahora también inventamos celular
  };
}

// REGISTRAR
export async function registrar(paData) {
  await delay(250);
  const dni = paData && paData.CNRODNI ? String(paData.CNRODNI) : '';
  if (!dni) return { ERROR: 'DNI NO EXISTE' };

  // Si envían campos separados, construir CNOMBRE
  let nombre = paData.CNOMBRE;
  if (!nombre && (paData.apellido1 || paData.apellido2 || paData.nombres)) {
    const a1 = paData.apellido1 || '';
    const a2 = paData.apellido2 || '';
    const n  = paData.nombres  || '';
    nombre = `${a1}/${a2}/${n}`;
  }

  if (!nombre) return { ERROR: 'Error en llenado de campos' };

  const cel = paData.CNROCEL || paData.CELULAR || '';

  // Guardamos en "DB" en memoria
  _db.set(dni, { CNRODNI: dni, CNOMBRE: nombre, CNROCEL: cel });

  return { OK: 'OK' };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
