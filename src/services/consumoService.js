const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'

const apiClient = {
    async post(requestBody) {
        // ... (misma implementación de apiClient)
    }
}

// Registro de consumo (COD1020) - Para implementar después
export const registrarConsumo = async (payload) => {
    const requestBody = {
        ID: 'COD1020',
        CNRODNI: payload.CNRODNI,
        AIDCATE: payload.DATOS.map(item => item.CCODART),
        CDNIALU: payload.CUSUCOD // Asumiendo que CUSUCOD es el DNI del alumno
    }
    return await apiClient.post(requestBody)
}

export default {
    registrarConsumo
}