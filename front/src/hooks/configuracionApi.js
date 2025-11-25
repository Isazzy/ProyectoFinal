// front/src/api/configuracionApi.js
export const configuracionApi = {
  getConfiguracion: async () => {
    const response = await api.get('/turnos/configuracion/');
    return response.data;
  },
  
  updateConfiguracion: async (data) => {
    const response = await api.put('/turnos/configuracion/1/', data);
    return response.data;
  },
};