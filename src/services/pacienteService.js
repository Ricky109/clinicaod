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

export const buscar = async (paData) => {
    const requestBody = {
        ID: 'COD1010',
        CNRODNI: paData.CNRODNI,
        CUSUCOD: paData.CUSUCOD || 'U666'
    }
    return await apiClient.post(requestBody)
}

export const registrar = async (paData) => {
    const requestBody = {
        ID: 'COD1011',
        CNRODNI: paData.CNRODNI,
        CUSUCOD: paData.CUSUCOD || 'U666',
        CAPEPAT: paData.CAPEPAT,
        CAPEMAT: paData.CAPEMAT,
        CNOMBRE: paData.CNOMBRE,
        CSEXO: paData.CSEXO,
        DNACIMI: paData.DNACIMI,
        CNUEVO: 'S',
        CNROCEL: paData.CNROCEL,
        CDNIEST: paData.CDNIEST
    }
    return await apiClient.post(requestBody)
}

export default {
    buscar,
    registrar
}