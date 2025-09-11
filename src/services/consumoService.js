const API_URL = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos'

const apiClient = {
    async post(requestBody) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            throw new Error('Error de conexión con el servidor')
        }

        const data = await response.json()
        
        if (data.ERROR) {
            throw new Error(data.ERROR)
        }

        return data
    }
}

// Registro de consumo (COD1020) - Generar pago
export const registrarConsumo = async (payload) => {
    const requestBody = {
        ID: 'COD1020',
        CNRODNI: payload.CNRODNI,
        AIDCATE: payload.DATOS.map(item => item.CCODART),
        CDNIALU: payload.CDNIALU 
    }
    
    console.log('Enviando a API COD1020:', requestBody)
    return await apiClient.post(requestBody)
}

export default {
    registrarConsumo
}