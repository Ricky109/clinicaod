const API_URL = "https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos";

const apiClient = {
  async post(requestBody) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Error de conexión con el servidor");
    }

    const data = await response.json();

    if (data.ERROR) {
      throw new Error(data.ERROR);
    }

    return data;
  },
};

// 🔎 Búsqueda de tratamientos (API0007)
export const buscarTratamientos = async (terminoBusqueda, dniAlumno) => {
  const requestBody = {
    ID: "API0007",
    CDNIALU: dniAlumno,
    CUSUCOD: "U666",
    CPARAM: terminoBusqueda,
  };

  try {
    const response = await apiClient.post(requestBody);

    // Adaptar el JSON que devuelve la API
    return response.map((tratamiento) => ({
      CCODART: tratamiento.CIDCATE, // usamos CIDCATE como clave
      CDESCRI: tratamiento.CDESCRI,
      NPRECIO: tratamiento.NPRECIO,
    }));
  } catch (error) {
    console.error("Error buscando tratamientos:", error);
    throw error;
  }
};

export default {
  buscarTratamientos,
};
